import { 
	emitter, 
	inputSanitizer, 
	extractDataIfInputIsValid, 
	getDeliveryCostAndDiscount, 
	getSortedBestExecutionOrderOfPackages,
    getDeliveryTimeAndCostOfAllPackages } from "./utils.js";

let chargePerKG = 10 
let chargePerKm = 5
let offers = [
	{ offerCode: 'OFR001', discount: 10, maxDistance: 200, minWeight: 70, maxWeight: 200 },
	{ offerCode: 'OFR002', discount: 7, minDistance: 50, maxDistance: 150, minWeight: 100, maxWeight: 250 },
	{ offerCode: 'OFR003', discount: 5, minDistance: 50, maxDistance: 250, minWeight: 10, maxWeight: 150 },
]


emitter.on("ctrl+r Pressed", (commandLineInputArray) => {
	// if control r is pressed then it will fire an event which will give the input typed by user
	let sanitizedInput = inputSanitizer(commandLineInputArray);

	let { valid, baseDeliveryCost, totalPackages, noOfVehicals, maxSpeed, maxCarriableWeight, packages, errorMessage } = extractDataIfInputIsValid(sanitizedInput);

	if(valid){

		//convert array to proper json format
		packages = packages.map(i => {
			var [id, weight, distance, offerCode] = i
			weight = parseFloat(weight)
			distance = parseFloat(distance)
			return { id, weight, distance, offerCode }
		})

		if(!noOfVehicals || !maxCarriableWeight || !maxSpeed){
			// Calculate only discount and cost because noOfVehicals, maxCarriableWeight and maxSpeed is not provided

			
			console.log('');
			console.log('No of vehicals, max weight, max speed not provided. Only discount and cost will be calculated');
			console.log('=================================');
			console.log('OUTPUT');
			console.log('=================================');
			for (let i = 0; i < packages.length; i++) { 
				let { cost, discount } = getDeliveryCostAndDiscount(packages[i], offers, baseDeliveryCost, chargePerKG, chargePerKm)
				packages[i].cost = cost
				packages[i].discount = discount
				console.log(`${packages[i].id}  ${packages[i].discount}   ${packages[i].cost}`);
			}
			console.log('=================================');
			console.log('');


		}else{
			// Calculate everything because all the parameters are provided
			
			console.log('noOfVehicals maxCarriableWeight maxSpeedEverything provided so everything will be calculated including delivery time and cost');

			// Get The best execution order of package delivery
			let sortedBestPackages = getSortedBestExecutionOrderOfPackages(packages, maxCarriableWeight);
			
			// Calculate Delivery Time of Already Sorted Packages
			let calculatedPackages = getDeliveryTimeAndCostOfAllPackages(sortedBestPackages, maxSpeed, offers, baseDeliveryCost, chargePerKG, chargePerKm, noOfVehicals)


			//Sort Calculated packaged based on input given 
			let finalOutputArray = []
			for (let i = 0; i < packages.length; i++) { 
				let packageId = packages[i].id
				let filteredData = calculatedPackages.filter( i => i.id===packageId)
				if(filteredData[0]){
					finalOutputArray.push(filteredData[0])
				} 
			}
			packages = finalOutputArray
			console.log('');
			console.log('=================================');
			console.log('OUTPUT');
			console.log('=================================');
			for (let i = 0; i < packages.length; i++) { 
				console.log(`${packages[i].id}  ${packages[i].discount}   ${packages[i].cost}   ${packages[i].deliveryTime}`);
			}
			console.log('=================================');
			console.log('');
			
		}
	}else{
		console.log(`Your input is not valid. ${errorMessage}`);
	}
	
});
