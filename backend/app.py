from flask import Flask,render_template,request,jsonify
from flask_cors import CORS, cross_origin
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask import url_for
import pandas as pd
import geopandas as gpt
import numpy as np
import json
from datetime import datetime,timedelta
import random
from statistics import median,mean
from sklearn.metrics import mean_absolute_error

import eventlet

import time 

# default_station_json = 0
# request_status = 0
zone_level_selected = 0
active_connections = 0

app = Flask(__name__, static_url_path='/static')
cors = CORS(app)
app.config['SECRET_KEY'] = 'conti!'
socketio = SocketIO(app, async_mode='eventlet',cors_allowed_origins='*')

INTERVAL_TASK_ID = 'interval-task-id'

users = [
    {"username": "sam", "password": "sam"},
    {"username": "eric", "password": "eric"},
]

class SimController(object):

    switch = False
    row_no = 0

    def __init__(self, socketio):
        self.socketio = socketio
        self.switch = False
        self.first_run = True
        self.row_no = 0
        self.country_change = False
        self.city = "manhattan"
        self.city_actual_demand_json = json.loads(pd.read_csv('./resources/demand_prediction/actual_demands.csv').to_json(orient='records'))
        self.city_predicted_demand_json = json.loads(pd.read_csv('./resources/demand_prediction/predicted_demands.csv').to_json(orient='records'))
        self.sg_inflow_json = json.loads(pd.read_csv('./resources/singapore/singapore_actual_inflow.csv').to_json(orient='records'))
        self.sg_outflow_json = json.loads(pd.read_csv('./resources/singapore/singapore_actual_outflow.csv').to_json(orient='records'))
        self.city_supply_demand_gap_json = json.loads(pd.read_csv('./resources/supply_demand_gap/manhattan_supply_demand_gap_new.csv').to_json(orient='records'))
        self.city_rebalancing_json = json.loads(pd.read_csv('./resources/rebalancing/supply_demand_rebalancing.csv').to_json(orient='records'))
        self.SDR_rebalancing_json = json.loads(pd.read_csv('./resources/rebalancing/acc_served_demand_rebalancing_ratio.csv').to_json(orient='records'))
        self.SDR_wait_json = json.loads(pd.read_csv('./resources/rebalancing/acc_served_demand_wait_ratio.csv').to_json(orient='records'))
        self.income_rebalancing_json = json.loads(pd.read_csv('./resources/rebalancing/income_per_hour_rebalancing.csv').to_json(orient='records'))
        self.income_wait_json = json.loads(pd.read_csv('./resources/rebalancing/income_per_hour_wait.csv').to_json(orient='records'))
        self.car_movement_json = json.loads(pd.read_csv('./resources/rebalancing/test_move.csv').to_json(orient='records'))
        self.graph_data = {}
        self.demand_gap_graph_data = {}
        self.mape_data = []
        self.mae_data = []
        self.actual_demand_24h = []
        self.predicted_demand_24h = []
        self.daily_highest_data = []
        self.supply_demand_gap_24h = []
        self.sdr_income = {}
        self.sleep_time = 1.5

    def run_simulator(self):
        self.switch = True
        row_no = self.row_no
        self.country_change = False
        print("run_simulator")
        
        
        while self.switch and (self.row_no < len(self.city_actual_demand_json)):
            if active_connections > 0:
                # print(f"state is {self.switch}")
                # update_time(rebalance_output,10)
                self.graph_data.clear()
                self.demand_gap_graph_data.clear()
                self.update_24h_dataset()
                self.line_graph()
                self.demand_gap_graph()
                # self.mape()
                self.mae()
                self.net_flow()
                self.calculate_average()
                self.calculate_median()
                self.calculate_daily_highest()
                self.compute_correlation()
                self.relative_errors_median()
                self.total_demand_24h()
                self.sum_supply_demand_gap_24h()
                self.collate_rebalancing()
                self.socketio.emit('hourly_actual_demand_json', self.city_actual_demand_json[self.row_no])
                self.socketio.emit('graph_data', self.graph_data)
                self.socketio.emit('demand_gap_data', self.city_supply_demand_gap_json[self.row_no])
                self.socketio.emit('rebalancing_data',self.city_rebalancing_json[self.row_no])
                self.socketio.emit('sdr_income',self.sdr_income)
                self.socketio.emit('car_movement', self.car_movement_json[self.row_no])
                self.socketio.emit('future_car_movement', self.car_movement_json[self.row_no+1])


                self.row_no+=1
                eventlet.sleep(self.sleep_time)
                if self.country_change == True:
                    self.switch = False 
                    break
            else:
                break

    def pause(self):
        self.switch = False
        print(f"state is {self.switch}")

    def restart(self):
        self.switch = False
        self.row_no = 0
        # self.switch = True
        # self.run_simulator()

    def shift_country(self,city_actual_demand_json,city_predicted_demand_json):
        self.country_change = True
        self.row_no = 0
        self.city_actual_demand_json = city_actual_demand_json
        self.city_predicted_demand_json = city_predicted_demand_json
        self.mape_data.clear()
        self.mae_data.clear()
        self.actual_demand_24h.clear()
        self.predicted_demand_24h.clear()
        self.daily_highest_data.clear()
        self.zone_id = 0
        global zone_level_selected
        zone_level_selected = 0
        
        print("in shift country")

    def collate_rebalancing(self):
        self.sdr_income["sdr_rebalancing"] = self.SDR_rebalancing_json[self.row_no]["sdr"]
        self.sdr_income["sdr_wait"] = self.SDR_wait_json[self.row_no]["sdr"]
        self.sdr_income["income_rebalancing"] = self.income_rebalancing_json[self.row_no]["income"]
        self.sdr_income["income_wait"] = self.income_wait_json[self.row_no]["income"]

    def line_graph(self):
        self.graph_data["predicted_total_demand"] = self.city_predicted_demand_json[self.row_no]["total_demand"]
        self.graph_data["predicted_timestamp"] = self.city_predicted_demand_json[self.row_no]["date_time"]
        if self.row_no >= 3:
            if self.row_no > 0:
                print(self.row_no -1)
        self.graph_data["actual_total_demand"] = self.city_actual_demand_json[self.row_no]["total_demand"]
        self.graph_data["actual_timestamp"] = self.city_actual_demand_json[self.row_no]["date_time"]

        if zone_level_selected:
            self.graph_data["predicted_total_demand"] = self.city_predicted_demand_json[self.row_no][self.zone_id]
            self.graph_data["predicted_timestamp"] = self.city_predicted_demand_json[self.row_no]["date_time"]
            if self.row_no > 3:
                self.graph_data["actual_total_demand"] = self.city_actual_demand_json[self.row_no][self.zone_id]
                self.graph_data["actual_timestamp"] = self.city_actual_demand_json[self.row_no]["date_time"]


        graph_data_json = json.dumps(self.graph_data)

    def demand_gap_graph(self):
        self.demand_gap_graph_data["total_demand_gap"] = self.city_supply_demand_gap_json[self.row_no]["total_gap"]
        self.demand_gap_graph_data["demand_gap_timestamp"] = self.city_supply_demand_gap_json[self.row_no]["date_time"]

        if zone_level_selected:
            self.demand_gap_graph_data["total_demand_gap"] = self.city_predicted_demand_json[self.row_no][self.zone_id]
            self.demand_gap_graph_data["demand_gap_timestamp"] = self.city_predicted_demand_json[self.row_no]["date_time"]


        demand_gap_graph_data_json = json.dumps(self.demand_gap_graph_data)

        
    def mape(self):
        actual_predice_fraction = abs(self.city_actual_demand_json[self.row_no]["total_demand"] - self.city_predicted_demand_json[
            self.row_no]["total_demand"])/self.city_actual_demand_json[self.row_no]["total_demand"]
        
        self.mape_data.append(actual_predice_fraction)
        if len(self.mape_data) > 24:
            self.mape_data.pop(0)
        mape_val = round((sum(self.mape_data)/len(self.mape_data))*100,2)
        self.graph_data["mape_city"] =  mape_val


    def mae(self):
        if self.city == "singapore":
            mae_val = round(mean_absolute_error(self.actual_demand_24h, self.predicted_demand_24h),2)
            self.graph_data["mae"] = mae_val


    def calculate_average(self):
        average_val = round(mean(self.actual_demand_24h),2)
        self.graph_data["average_demand"] = average_val


    def calculate_median(self):
        if self.city == "singapore":
            median_val = round(median(self.actual_demand_24h),2)
            self.graph_data["median"] = median_val

    
    def update_24h_dataset(self):
        if zone_level_selected:
            print('zone_level_selected ', zone_level_selected)
            if (self.zone_id != 0):
                self.actual_demand_24h.append(self.city_actual_demand_json[self.row_no][self.zone_id])
                self.predicted_demand_24h.append(self.city_predicted_demand_json[self.row_no][self.zone_id])
                if len(self.actual_demand_24h) > 24:
                    self.actual_demand_24h.pop(0)
                    self.predicted_demand_24h.pop(0)
        else:
            self.actual_demand_24h.append(self.city_actual_demand_json[self.row_no]["total_demand"])
            self.predicted_demand_24h.append(self.city_predicted_demand_json[self.row_no]["total_demand"])
            self.supply_demand_gap_24h.append(self.city_supply_demand_gap_json[self.row_no]["total_gap"])
            if len(self.actual_demand_24h) > 24:
                self.actual_demand_24h.pop(0)
                self.predicted_demand_24h.pop(0)
                self.supply_demand_gap_24h.pop(0)


    def calculate_daily_highest(self):
        if zone_level_selected:
            self.daily_highest_data.append((self.city_actual_demand_json[self.row_no]["date_time"],self.city_actual_demand_json[
                self.row_no][self.zone_id]))
            if len(self.daily_highest_data) > 24:
                self.daily_highest_data.pop(0)
 
        else:
            self.daily_highest_data.append((self.city_actual_demand_json[self.row_no]["date_time"],self.city_actual_demand_json[
                self.row_no]["total_demand"]))
            if len(self.daily_highest_data) > 24:
                self.daily_highest_data.pop(0)
                
        sorted_daily_values = sorted(self.daily_highest_data, key=lambda x: x[1], reverse=True)
        self.graph_data["daily_highest_demand"] = sorted_daily_values[0]

    
    def net_flow(self):
        if self.city == "singapore":
            if zone_level_selected:
                netflow_val = self.sg_inflow_json[self.row_no][self.zone_id] - self.sg_outflow_json[
                    self.row_no][self.zone_id]
            else:
                netflow_val = self.sg_inflow_json[self.row_no]["total_inflow"] - self.sg_outflow_json[
                    self.row_no]["total_outflow"]
            self.graph_data["netflow"] = netflow_val

    def compute_correlation(self):
        if self.city == "singapore":
            actual_demand_np = np.array(self.actual_demand_24h)
            predicted_demand_np = np.array(self.predicted_demand_24h)

            corr = round(np.corrcoef(actual_demand_np, predicted_demand_np)[0, 1],3)
            self.graph_data["correlation"] = corr


    def relative_errors_median(self):
        if self.city == "manhattan":
            relative_error = [list(map(float, self.actual_demand_24h))[i] - list(map(float, self.predicted_demand_24h))[i] 
                              for i in range(len(self.actual_demand_24h))]
            relative_error_med_val = round(median(relative_error),2)
            self.graph_data["relative_error_median"] = relative_error_med_val
            # print(relative_error_med_val)


    def total_demand_24h(self):
        if self.city == "manhattan":
            self.graph_data["total_actual_demand_24h"] = sum(self.actual_demand_24h)


    def sum_supply_demand_gap_24h(self):
        if self.city == "manhattan":
            self.graph_data["total_supply_demand_gap_24h"] = sum(self.supply_demand_gap_24h)
            # print(self.supply_demand_gap_24h)

sim_controller_obj = None  # Initialize the variable outside the function


@app.route('/', methods=['GET'])
# @cross_origin()
def index():
    global zone_level_selected
    zone_level_selected = 0
    df_mh_actual_demand = pd.read_csv('./resources/demand_prediction/actual_demands.csv')
    df_mh_predicted_demand = pd.read_csv('./resources/demand_prediction/predicted_demands.csv')
    df_sg_actual_demand = pd.read_csv('./resources/singapore/singapore_actual_demand.csv')
    df_sg_predicted_demand = pd.read_csv('./resources/singapore/singapore_predicted_demand.csv')
    df_sg_inflow = pd.read_csv('./resources/singapore/singapore_actual_inflow.csv')
    df_sg_outflow = pd.read_csv('./resources/singapore/singapore_actual_outflow.csv')
    routes = pd.read_csv('./resources/rebalancing/routes_between_zones.csv')

    points_mh_actual = df_mh_actual_demand.to_json(orient='records')
    points_mh_predicted = df_mh_predicted_demand.to_json(orient='records')
    points_sg_actual = df_sg_actual_demand.to_json(orient='records')
    points_sg_predicted = df_sg_predicted_demand.to_json(orient='records')
    points_sg_inflow = df_sg_inflow.to_json(orient='records')
    points_sg_outflow = df_sg_outflow.to_json(orient='records')
    routes = routes.to_json(orient='records')

    global mh_actual_demand_json
    mh_actual_demand_json = json.loads(points_mh_actual)

    global mh_predicted_demand_json
    mh_predicted_demand_json = json.loads(points_mh_predicted)

    global sg_actual_demand_json
    sg_actual_demand_json = json.loads(points_sg_actual)

    global sg_predicted_demand_json
    sg_predicted_demand_json = json.loads(points_sg_predicted)

    global sg_inflow_json
    sg_inflow_json = json.loads(points_sg_inflow)

    global sg_outflow_json
    sg_outflow_json = json.loads(points_sg_outflow)


    df_manhtn_gps = pd.read_csv('./resources/zones/manhattan_zones.csv')
    df2_manhtn_gps = df_manhtn_gps.set_index('Zone')
    manhtn_gps_points_dict = df2_manhtn_gps.to_dict('index')


    df_sg_gps = pd.read_csv('./resources/singapore/singapore_zones.csv')
    df2_sg_gps = df_sg_gps.set_index('Zone')
    sg_gps_points_dict = df2_sg_gps.to_dict('index')

    gps_data_json = json.dumps({
        "manhattan": manhtn_gps_points_dict,
        "singapore": sg_gps_points_dict
    })

    requester_id = request.headers.get('Requester-ID')
    print('Requester ID:', requester_id)

    return jsonify({
        "mh_actual_demand": mh_actual_demand_json,
        "mh_predicted_demand": mh_predicted_demand_json,
        "sg_actual_demand": sg_actual_demand_json,
        "sg_predicted_demand": sg_predicted_demand_json,
        "sg_inflow": sg_inflow_json,
        "sg_outflow": sg_outflow_json,
        "gps_data": gps_data_json,
        "routes": routes
    })

@socketio.on('connect')
def connect():
    global sim_controller_obj
    global active_connections
    active_connections += 1
    if sim_controller_obj is None:
        sim_controller_obj = SimController(socketio)
    print(f"\n\n\nWebSocket connection established. Active connections: {active_connections}\n\n\n")

@socketio.on('disconnect')
def disconnect():
    global active_connections
    active_connections -= 1
    print(f"\n\n\nWebSocket connection disconnected. Active connections: {active_connections}\n\n\n")
    if active_connections == 0:
        global sim_controller_obj
        sim_controller_obj.switch = False
        sim_controller_obj.row_no = 0
        sim_controller_obj = None
        del sim_controller_obj
        sim_controller_obj = None
        print("sim controller deleted and set to None")

@socketio.on('error')
def handle_error(error):
    print("Received error:")
    print("Type:", error['type'])
    print("Message:", error['message'])
    print("Stack Trace:", error['stackTrace'])
    sim_controller_obj = None

# start socket function for chart 
@socketio.on('start')
def start_simulation():
    print("Start simulation")
    if sim_controller_obj.switch == False and sim_controller_obj.first_run:
        socketio.start_background_task(target=sim_controller_obj.run_simulator())
        sim_controller_obj.first_run = False
    elif not (sim_controller_obj.first_run or sim_controller_obj.switch):                
        sim_controller_obj.run_simulator()
    else:
        print("error while trying to start simulation")

# pause socket function for chart, used by StartPause button
@socketio.on('pause')
def pause_simulation():
    print("Pause simulation")
    sim_controller_obj.pause()

# pause socket function for chart, currently not in use 
# @socketio.on('resume')
# def resume_simulation():
#     eventlet.sleep(1)
#     if sim_controller_obj.switch == False:
#         print("Resume simulation")
#         sim_controller_obj.run_simulator()

# restart socket function for chart, used by restart button
@socketio.on('restart')
def restart_simulation():
    eventlet.sleep(1)
    print("restart")
    sim_controller_obj.row_no = 0
    
    # if sim_controller_obj.switch == False:
        # sim_controller_obj.run_simulator()
    # else:
    sim_controller_obj.restart()

# add receiver for changing eventlet sleeping time based on active tab 
@socketio.on('sleeptime')
def change_sleeptime(time):
    sim_controller_obj.sleep_time = time

# country select function, used by country select dropdown 
@socketio.on('country')
def country(city):
    eventlet.sleep(1)
    print(f"{city} selected")

    if city == "singapore":
        sim_controller_obj.shift_country(sg_actual_demand_json, sg_predicted_demand_json)
    elif city == "manhattan":
        sim_controller_obj.shift_country(mh_actual_demand_json, mh_predicted_demand_json)

    sim_controller_obj.city = city

# zone select function, used by zone select dropdown 
@socketio.on('zone')
def switch_zone(zone_id):
    eventlet.sleep(1)
    print("zone: "+ zone_id)
    global zone_level_selected
    if (zone_id == '0') :
        zone_level_selected = 0
    else : 
        zone_level_selected = 1
    print('zone switched ', zone_level_selected)
    sim_controller_obj.zone_id = zone_id
    sim_controller_obj.mae_data.clear()
    sim_controller_obj.actual_demand_24h.clear()
    sim_controller_obj.predicted_demand_24h.clear()
    sim_controller_obj.daily_highest_data.clear()


@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    # Check credentials and return an appropriate response
    for user in users:
        if user['username'] == username and user['password'] == password:
            return jsonify({'message': 'Login successful'}), 200
    
    return jsonify({'message': 'Login failed'}), 401
    

if __name__ == "__main__":
    socketio.run(app, host="127.0.0.1", port=5000, debug=True)
