import pandas as pd
# formulas for supply demand gap:
# supply_wait - actual_demands (rebalancing switch off)
# supply_rebalancing - actual_demands  (rebalancing switch on)


# # Load the CSV files into pandas DataFrames
# df1 = pd.read_csv('./resources/manhattan_predicted_demand.csv')
# df2 = pd.read_csv('./resources/manhattan_actual_demand.csv')

# # Perform the subtraction operation on columns 2 to 20
# columns_to_subtract = df1.columns[1:68] #for singapore 1:76
# df1[columns_to_subtract] = df1[columns_to_subtract] - df2[columns_to_subtract]

# # Create a new DataFrame with the subtracted values
# df1[columns_to_subtract] = df1[columns_to_subtract].round(decimals=0).astype(int)
# new_df = df1

# # Write the new DataFrame to a new CSV file
# new_df.to_csv('manhattan_supply_demand_gap1.csv', index=False)


# df1 = pd.read_csv('./resources/manhattan_predicted_demand.csv')

# Load the CSV files into pandas DataFrames
df1 = pd.read_csv('./supply_rebalancing.csv')
df2 = pd.read_csv('./actual_demands.csv')

# Perform the subtraction operation on columns 2 to 20
columns_to_subtract = df1.columns[1:68] #for singapore 1:76
df1[columns_to_subtract] = df1[columns_to_subtract] - df2[columns_to_subtract]

# Create a new DataFrame with the subtracted values
df1[columns_to_subtract] = df1[columns_to_subtract].round(decimals=0).astype(int)
new_df = df1

# Write the new DataFrame to a new CSV file
new_df.to_csv('supply_demand_rebalancing.csv', index=False)
