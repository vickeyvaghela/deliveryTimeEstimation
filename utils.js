// var readline = require("readline");
import readline from "readline";
import { EventEmitter } from "events";

var emitter = new EventEmitter();

var commandLineInputArray = [];

// Anonymous function To Initialize Command Line Interface
(() => {
	console.log();
	console.log("NOTE: Please refer instructions.txt file or requirment document for valid input formats");
	console.log("Press (Ctrl + Insert) to paste input or type your input manually (You can use enter key)");
	console.log("Press (Ctrl + r) to calculate the output after you are done with your inputes");
	console.log("Press (Ctrl + c) to stop the process any time");

	readline.emitKeypressEvents(process.stdin);

	var rl = readline.createInterface({ input: process.stdin, output: process.stdout });

	rl.prompt();

	rl.on("line", function (cmd) {
		commandLineInputArray.push(cmd);
	});

	rl.on("close", function (cmd) {
		console.log(commandLineInputArray.join("\n"));
		process.exit(0);
	});

	process.stdin.on("keypress", (ch, key) => {
		if (key && key.ctrl && key.name == "r") {
			process.stdin.emit("keypress", "\n", { name: "return" });
			emitter.emit("ctrl+r Pressed", commandLineInputArray);
			commandLineInputArray = [];

			// process.stdin.pause();
		}
	});
	//process.stdin.setRawMode(true);
})();

function inputSanitizer(input) {
	// removes extra spaces and convert into array
	return input
		.map((i) => i.replace(/\s+/g, " ").trim())
		.filter((i) => i !== "")
		.map((i) => i.split(" "));
}

function extractDataIfInputIsValid(input) {
	var onlyNumbersRegex = /^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$/;
	let valid = true;
	let errorMessage = "";

	if (input.length === 0) {
		valid = false;
		errorMessage = "No input provided";
	}

	if (valid) {
		let [baseDeliveryCost, totalPackages] = input[0];

		if (!onlyNumbersRegex.test(baseDeliveryCost) || !onlyNumbersRegex.test(totalPackages)) {
			//checking if cost and total package is valid numbers
			valid = false;
			errorMessage = "baseDeliveryCost and totalPackages should be number only";
		}

		totalPackages = parseInt(totalPackages);
		baseDeliveryCost = parseFloat(baseDeliveryCost);

		if (input[0].length !== 2) {
			valid = false;
			errorMessage = "Formatting is not valid. Please check instructions.txt for valid formates";
		}
		// if(input[totalPackages+1] && input[totalPackages+1].length !== 3){
		// 	valid = false
		// 	errorMessage = 'Formatting is not as described in doc'
		// }

		if (input[totalPackages + 1]) {
			var [noOfVehicals, maxSpeed, maxCarriableWeight] = input[totalPackages + 1];

			if (!onlyNumbersRegex.test(noOfVehicals) || !onlyNumbersRegex.test(maxSpeed) || !onlyNumbersRegex.test(maxCarriableWeight)) {
				valid = false;
				errorMessage = "noOfVehicals, maxSpeed and maxCarriableWeight should be number only";
			}
		}

		let packages = [];

		if (valid) {
			if (input.length === totalPackages + 1 || input.length === totalPackages + 2) {
			} else {
				valid = false;
				errorMessage = "Some package information missing";
			}
			// if(totalPackages !== input.length-2){
			// 	valid = false
			// 	errorMessage = 'Some package information missing'
			// }
		}

		if (valid) {
			for (let i = 1; i <= totalPackages; i++) {
				let packageWeight = input[i][1];
				let packageDistance = input[i][2];

				if (!onlyNumbersRegex.test(packageWeight) || !onlyNumbersRegex.test(packageDistance)) {
					valid = false;
					errorMessage = "packageWeight  and packageDistance should be number only";
				}
				if(valid){
					let tempWeight = parseInt(packageWeight)
					if(tempWeight>maxCarriableWeight){
						errorMessage = 'Package weight can not be more then maxCarriableWeight' 
						valid = false
					}
				}
				packages.push(input[i]);
			}
		}

		if (valid) {
			noOfVehicals = parseInt(noOfVehicals);
			maxSpeed = parseInt(maxSpeed);
			maxCarriableWeight = parseInt(maxCarriableWeight);

			var valueArr = packages.map(function (item) {
				return item[0];
			});
			var isDuplicate = valueArr.some(function (item, idx) {
				return valueArr.indexOf(item) != idx;
			});
			if (isDuplicate) {
				valid = false;
				errorMessage = "Package Id can not be repeated";
			}
		}
		return { valid, baseDeliveryCost, totalPackages, noOfVehicals, maxSpeed, maxCarriableWeight, packages, errorMessage };

	}else{
		return { valid, errorMessage }
	}

}

function getDeliveryCostAndDiscount(singlePackage, offers, baseDeliveryCost, chargePerKG, chargePerKm) {
	let offer = offers.filter((i) => i.offerCode === singlePackage.offerCode)?.[0] ?? null;

	let isOfferValid = true;

	if (offer) {
		if (offer.maxDistance && singlePackage.distance > offer.maxDistance) isOfferValid = false;

		if (offer.minDistance && singlePackage.distance < offer.minDistance) isOfferValid = false;

		if (offer.maxWeight && singlePackage.weight > offer.maxWeight) isOfferValid = false;

		if (offer.minWeight && singlePackage.weight < offer.minWeight) isOfferValid = false;
	} else {
		isOfferValid = false;
	}

	let cost = baseDeliveryCost + singlePackage.weight * chargePerKG + singlePackage.distance * chargePerKm;
	let discount = 0;

	if (isOfferValid) {
		discount = (cost * offer.discount) / 100;
		cost = cost - discount;
	}

	return { cost, discount };
}

function chooseBestPackageForSingleVehicle(pendingPackages, maxCarriableWeight) {
	function allPossibleCombinationGenerator(array) {
		function arrayCombinatorBynumber(arr, n, r) {
			// Javascript program to print all
			// combination of size r in an array of size n

			let combinedArray = [];

			/*  arr[]  ---> Input Array
				data[] ---> Temporary array to store current combination
				start & end ---> Starting and Ending indexes in arr[]
				index  ---> Current index in data[]
				r ---> Size of a combination to be printed */
			function combinationUtil(arr, data, start, end, index, r) {
				if (index == r) {
					let tempArray = [];
					for (let j = 0; j < r; j++) {
						tempArray.push(data[j]);
					}
					combinedArray.push(tempArray);
				}

				// replace index with all possible elements. The condition
				// "end-i+1 >= r-index" makes sure that including one element
				// at index will make a combination with remaining elements
				// at remaining positions
				for (let i = start; i <= end && end - i + 1 >= r - index; i++) {
					data[index] = arr[i];
					combinationUtil(arr, data, i + 1, end, index + 1, r);
				}
			}

			// The main function that prints all combinations of size r
			// in arr[] of size n. This function mainly uses combinationUtil()
			function printCombination(arr, n, r) {
				// A temporary array to store all combination one by one
				let data = new Array(r);
				// Print all combination using temporary array 'data[]'
				combinationUtil(arr, data, 0, n - 1, 0, r);
			}

			printCombination(arr, n, r);

			return combinedArray;
		}

		let finalResult = [];

		for (let i = 1; i <= array.length; i++) {
			finalResult.push(...arrayCombinatorBynumber(pendingPackages, pendingPackages.length, i));
		}

		return finalResult;
	}

	function sortedBestPackages(allPossibleCombinations) {
		let finalResult = [];
		for (let i = 0; i < allPossibleCombinations.length; i++) {
			let combination = allPossibleCombinations[i];
			let totalPackageWeight = combination.reduce((accumulator, current) => {
				return accumulator + current.weight;
			}, 0);
			finalResult.push({ combination, totalPackageWeight });
		}

		finalResult = finalResult.sort((a, b) => {
			if (b.totalPackageWeight === a.totalPackageWeight) {
				// if Weight is same then sorting by less distance to cover for that package
				let maxDistanceInPackageA = Math.max.apply(
					Math,
					a.combination.map(function (o) {
						return o.distance;
					}),
				);
				let maxDistanceInPackageB = Math.max.apply(
					Math,
					b.combination.map(function (o) {
						return o.distance;
					}),
				);

				return maxDistanceInPackageA - maxDistanceInPackageB;
			} else {
				return b.totalPackageWeight - a.totalPackageWeight;
			}
		});
		return finalResult;
	}

	let allPossibleCombinations = allPossibleCombinationGenerator(pendingPackages);

	let sortedPackages = sortedBestPackages(allPossibleCombinations);

	let deliverablePackages = sortedPackages.filter(function (el) {
		return el.totalPackageWeight <= maxCarriableWeight;
	});

	return deliverablePackages[0].combination;
}

function getSortedBestExecutionOrderOfPackages(packages, maxCarriableWeight) {
	let leftOverPackages = packages;
	let sortedBestPackages = [];

	while (leftOverPackages.length != 0) {
		// Generate best combination after trying all combination to pick from given packages and push into sortedBestPackages variable
		let bestCombinationArray = chooseBestPackageForSingleVehicle(leftOverPackages, maxCarriableWeight);
		sortedBestPackages.push(bestCombinationArray);

		//Filter Out Already Pushed Package to get leftOverPackages
		leftOverPackages = leftOverPackages.filter((el) => {
			return !bestCombinationArray.find((element) => {
				return element.id === el.id;
			});
		});
	}
	return sortedBestPackages;
}

function getDeliveryTimeAndCostOfAllPackages(sortedBestPackages, maxSpeed, offers, baseDeliveryCost, chargePerKG, chargePerKm, noOfVehicals) {
	let finalResponse = [];
	let vehicleAvaliabilityArray = Array(noOfVehicals).fill(0);
	for (let pkgIndex = 0; pkgIndex < sortedBestPackages.length; pkgIndex++) {
		const deliverablePackages = sortedBestPackages[pkgIndex];
		for (let singlePkgIndx = 0; singlePkgIndx < deliverablePackages.length; singlePkgIndx++) {
			let singlePackage = deliverablePackages[singlePkgIndx];
			//console.log('package',package);
			singlePackage.deliveryTime =
				parseFloat(((parseInt((singlePackage.distance / maxSpeed) * 100) / 100 + vehicleAvaliabilityArray[0]) * 100).toFixed(2)) / 100;

			let { cost, discount } = getDeliveryCostAndDiscount(singlePackage, offers, baseDeliveryCost, chargePerKG, chargePerKm);
			singlePackage.cost = cost;
			singlePackage.discount = discount;

			finalResponse.push(singlePackage);
		}

		let maxDistance = Math.max(...deliverablePackages.map((singlePackage) => singlePackage.distance));
		let vehicleAvaliableTime = parseInt(((parseInt((maxDistance / maxSpeed) * 100) / 100) * 2 + vehicleAvaliabilityArray[0]) * 100) / 100;

		// After each delivery updating vehicle avaliability based on distance
		vehicleAvaliabilityArray.shift();
		vehicleAvaliabilityArray.push(vehicleAvaliableTime);
		vehicleAvaliabilityArray.sort();
	}
	return finalResponse;
}

export {
	emitter,
	inputSanitizer,
	extractDataIfInputIsValid,
	getDeliveryCostAndDiscount,
	getSortedBestExecutionOrderOfPackages,
	getDeliveryTimeAndCostOfAllPackages,
};
