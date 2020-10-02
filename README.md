# Surf - free prototyping/shaping tools

This is a personal project that was initially intended to help with the shaping of a DIY board.
Although the existing computer-assisted shaping tools work well and provide a lot of flexibility they are all proprietary and the really low-level features are unaccessible.

## IO format: `board.json`

In order to save the prototypes a json-based format is used:

```json
{
    "y": [
        [0, 1.2899999999999994, 0, 1, 7],
        [0.22, 1.1499999999999992, 1, 1, -1],
        //... other points
        [0, 0.9758333333333337, 0, 1, 0]
    ],
    "x": [
        [0, 1.0000000000000004, 0, 0, 6],
        //... other points
        [0, 0, 0, 0, 4]
    ],
    "x0": [
        //... same
    ],
    "z": [
        //... same
    ],
    "length": 222,
    "width": 28.5,
    "thickness": 7.2,
    "continuity": []
}

```

`y`, `x`, `x0` and `z`  nested arrays are [Bezier curves](https://en.wikipedia.org/wiki/B%C3%A9zier_curve) each of the points is described by: 

- X coordinate
- Y coordinate
- freedom on X axis (0 if not movable and 1 otherwise)
- freedom on Y axis 
- a point number (from -2 to 13)

### Point numbering

The point numbers correspond to the ones described in figure 1.
If a point is real then the number is from 0 to 13.
If the point is a tangent then the number will be -1 if the tangent corresponds to the previous "real" point and -2 if its the next.

## TODO

- better symmetry rendering (full) [0, 1] 
- release selected point on toggle view

