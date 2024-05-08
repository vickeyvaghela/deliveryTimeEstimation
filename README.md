#Welcome To the command line app which calculates delivery time and cost of the packages

Getting Started:

Step 1: You should have node js installed for this code to run
Step 2: Paste the deliveryTimeEstimation at your desired location
Step 3: Open this folder in command line
Step 4: Type "npm start" or "node index.js" to start the CLI application


Notes: 
1. Press (Ctrl + Insert) to paste input or type your input manually (You can use enter key)
2. Press (Ctrl + r) to calculate the output after you are done with your inputes
3. Press (Ctrl + c) to stop the process any time.

There are two types of valid inpute formats you can give to CLI as described below. 


==============================
Format 1
==============================
base_delivery_cost no_of_packges
pkg_id1 pkg_weight1_in_kg distance1_in_km offer_code1
….
no_of_vehicles max_speed max_carriable_weight


==============================
Example Format 1
==============================
100 5
PKG1 50 30 OFR001
PKG2 75 125 OFR0008
PKG3 175 100 OFR003
PKG4 110 60 OFR002
PKG5 155 95 NA
2 70 200


==============================
Output 1 (If you provide no_of_vehicles, max_speed & max_carriable_weight then it will calculate delivery time and cost with discount also)
==============================
PKG1 0 750 3.98
PKG2 0 1475 1.78
PKG3 0 2350 1.42
PKG4 105 1395 0.85
PKG5 0 2125 4.19




==============================
Format 2
==============================
base_delivery_cost no_of_packges
pkg_id1 pkg_weight1_in_kg distance1_in_km offer_code1
pkg_id2 pkg_weight2_in_kg distance2_in_km offer_code2


==============================
Example Format 2
==============================
100 3
PKG1 5 5 OFR001
PKG2 15 5 OFR002
PKG3 10 100 OFR003


==============================
Output 2 (If you dont provide no_of_vehicles, max_speed & max_carriable_weight then it will only calculate cost and discount)
==============================
PKG1 0 175
PKG2 0 275
PKG 35 665
