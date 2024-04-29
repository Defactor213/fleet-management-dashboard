import pandas as pd
import json
import random

# highest demand supply gap 
dsgap = pd.read_csv('../supply_demand_gap/manhattan_supply_demand_gap_new.csv')
dsgap_dict = dsgap.to_dict('index')

# all zone centers
df_manhtn_gps = pd.read_csv('../zones/manhattan_zones.csv')
df2_manhtn_gps = df_manhtn_gps.set_index('Zone')
rows = []

manhtn_gps_keys_list = list(df2_manhtn_gps.to_dict('index').keys())

movement_matrix = pd.read_csv('../rebalancing/test_move.csv')
# headers: date_time, car_dict
# car_dict: car_id, start_zone, end_zone

# Iterate through all date_times
for date_time in movement_matrix['date_time']:
    # create matrices
    cars_dict = []
    num_cars = 4
    num_zones = 1

    for i in range(num_cars):
        car_start_end = {"carid": i}

        filtered_dsgap = {str(k): v for k, v in dsgap_dict[i].items() if k != "date_time"}
        # filtered_dsgap = {str(k): v for k, v in filtered_dsgap[i].items() if k != "total_gap"}
        sorted_dict = {k: filtered_dsgap[k] for k in sorted(filtered_dsgap, key=filtered_dsgap.get)}
        sorted_array = list(sorted_dict.keys())
        print(sorted_array[:5])
        # first two cars go min
        min_key = sorted_array[i]
        car_start_end["end"] = int(min_key)

        # create start zone
        random_zone = random.choice(manhtn_gps_keys_list)
        # Ensure start zone is not equal to end zone
        while str(random_zone) == str(min_key):
            random_zone = random.choice(manhtn_gps_keys_list)
        car_start_end["start"] = int(random_zone)

        # append to dict 
        cars_dict.append(car_start_end)


    # save row
    rows.append([date_time, json.dumps(cars_dict)])

# Create a DataFrame from the list of rows
result_df = pd.DataFrame(rows, columns=['date_time', 'car_dict'])

# Save the DataFrame to a new CSV file
result_df.to_csv('../rebalancing/test_move.csv', index=False)
print('saved')
