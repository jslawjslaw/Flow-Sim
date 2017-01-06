# Flow Sim

Flow Sim is a web application built on Javascript and Canvas that allows for visualization of fluid flow over an airfoil. It allows you to adjust the flow as well as the shape

## Features

### Canvas

The canvas element displays the rotational motion of the fluid around a shape. The colors indicate the curl, or local rotational motion, of the fluid. Use the controls to adjust the simulation.

### Flow Controls

* Steps: number of solver steps computed per frame.
* Flow Velocity: speed of the fluid.
* Viscosity: the thickness of the fluid due to internal friction.
* Contrast: scalar factor for the color gradient.
* Tracers: particles used to better visualize the motion of the fluid.

### Shape Controls

* Angle: angle at which the shape meets the fluid. Measured from the positive x-axis.
* Shape: black area that acts as a barrier to the fluid.

## Technical Information

I selected the Lattice Boltzmann method because it simplifies the setup of more intricate barriers with respect to other solvers. However, the algorithm is quite slow due to the number of computations it performs. Unfortunately, the Lattice Boltzmann method carries out many O(n<sup>2</sup>) loops that hinder its performance. For this reason, the Canvas element is only 500px wide and 200px high. The mesh starts out with square elements that are 2px by 2px, and the option is provided to increase this resolution. This reduces the element size to 1px by 1px effectively squaring the number of computations. If you select this option you will note the substantial difference in performance.

I wrote a small math package that performs basic linear algebra operations. This package was used primarily to perform the rotation when adjusting the shape angle.
The operations follow:
* Rotation takes in an angle in radians and generates a 2x2 rotation matrix.
* Multiply will multiply two arrays if they can be multiplied.
* Add and Subtract will add or subtract a 2x2 matrix and a 1x2 matrix, respectively.
