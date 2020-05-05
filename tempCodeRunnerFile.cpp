#include <stdio.h>
#define PI 3.14159265359

void calculateCircle(float r, float *d, float *c, float *s) {
	*d = r * 2.0;
	*c = PI * *d;	// Hodnota na adrese 'c' sa nastaví na PI * hodnota na adrese 'd'
	*s = PI * r * r;
}

int main() {

	float r = 5;
	float d, c, s;

	calculateCircle(r, &d, &c, &s);

	printf("Radius: %.2f\nDiameter: %.2f\nCircumference: %.2f\nSurface Area: %.2f", r, d, c, s);

	return 0;
}




