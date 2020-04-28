#include <stdio.h>
#include <cstring>

#define length 7

typedef struct {
	//Constructor function
	void constructor(char Type[], char Plate[], int Travelled) {
		strcpy(type, Type);
		strcpy(plate, Plate);
		travelled = Travelled;
	}

	//Struct data
	char type[20];
	char plate[9];
	int travelled;
} Car;

int main() {
	//Random data
	char types[][20] = {"Fiat", "Kia", "Citroen", "BMW", "Audi", "Skoda", "Renault"};
	char plates[][9] = {"BA 455QW", "TT 754BE", "ZA 903ZK", "BB 104XO", "LM 296SP", "PO 118TC", "SO 833HH"};
	int travelled[] = {68851, 56128, 54056, 41023, 38792, 87851, 9847};

	//Init structs
	Car cars[length];

	//Load data
	for(int i = 0; i < length; i++) {
		cars[i].constructor(types[i], plates[i], travelled[i]);
	}

	//Temp variable
	Car best = cars[0];

	//Find the best one
	for(int i = 1; i < length; i++) {
		if(cars[i].travelled < best.travelled) best = cars[i];
	}

	//Print data
	printf("Type: %s\nPlate: %s\nTravelled: %d", best.type, best.plate, best.travelled);

	return 0;
}