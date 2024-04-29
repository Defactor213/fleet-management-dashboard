import pandas as pd
import googlemaps
import json

api_key = ''
gmaps = googlemaps.Client(key=api_key)

# all zone centers
df_manhtn_gps = pd.read_csv('../zones/manhattan_zones.csv')
df2_manhtn_gps = df_manhtn_gps.set_index('Zone')
manhtn_gps_points_dict = df2_manhtn_gps.to_dict('index')

# 66 P 2 = 4290, incorrect number of routes, did not consider combinations between first 20 and everything else 

count = 0
# Iterate through all pairs of GPS points
for start_zone in manhtn_gps_points_dict:
    for end_zone in manhtn_gps_points_dict:
        if start_zone == end_zone:
            pass
        else:
            origin_data = manhtn_gps_points_dict[start_zone]
            destination_data = manhtn_gps_points_dict[end_zone]
            origin = f"{origin_data['lat']},{origin_data['lng']}"
            destination = f"{destination_data['lat']},{destination_data['lng']}"

            directions_result = gmaps.directions(origin, destination, mode="driving")
            print(str(start_zone) + " " + str(end_zone) + " route found")
            json_result = json.dumps(directions_result)

            if directions_result:
                count += 1
                # Create a DataFrame with the extracted information
                data = {'start_zone': [start_zone], 'end_zone': [end_zone], 'route': json_result}
                df = pd.DataFrame(data)

            # Save the DataFrame to a CSV file
            df.to_csv('../rebalancing/routes_between_zones.csv', mode='a', header=False, index=False)

print(str(count) + " routes found")