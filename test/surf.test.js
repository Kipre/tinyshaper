import bro from "./brotest/brotest.js";
import { roots, siblingPosition, evaluate } from "../js/surf.js";

bro.describe("finds roots", () => {
	bro.test("simple cases", () => {
		bro
			.expect(
				roots(
					[
						{ x: 0, y: 0 },
						{ x: 0, y: 1 },
						{ x: 0, y: 2 },
						{ x: 0, y: 3 },
					],
					{ y: 1.5 },
				),
			)
			.toEqual([0.5]);
		bro
			.expect(
				roots(
					[
						{ x: 0, y: 0 },
						{ x: 0, y: 1 },
						{ x: 0, y: 3 },
						{ x: 0, y: 4 },
					],
					{ y: 1 },
				),
			)
			.toEqual([0.2725479543882378]);
		bro
			.expect(
				roots(
					[
						{ x: 1, y: 0 },
						{ x: 2, y: 1 },
						{ x: 3, y: 3 },
						{ x: 4, y: 4 },
					],
					{ y: 1 },
				),
			)
			.toEqual([0.2725479543882378]);
		bro
			.expect(
				roots(
					[
						{ x: 0, y: 0 },
						{ x: 1, y: 1 },
						{ x: 3, y: 3 },
						{ x: 4, y: 4 },
					],
					{ x: 1 },
				),
			)
			.toEqual([0.2725479543882378]);
	});

	bro.test("more involved ones", () => {
		bro
			.expect(
				roots(
					[
						{ x: 0, y: 0 },
						{ x: 1, y: 0 },
						{ x: 2, y: 1 },
						{ x: 3, y: 0 },
					],
					{ x: 0.5 },
				),
			)
			.toEqual([0.16666666666666666]);
		bro
			.expect(
				roots(
					[
						{ x: 0, y: 0 },
						{ x: 0, y: 1 },
						{ x: 1, y: -1 },
						{ x: 1, y: 0 },
					],
					{ y: 0 },
				),
			)
			.toEqual([1, 0.4999999999999999]);
		bro
			.expect(
				roots(
					[
						{ x: 0, y: 0 },
						{ x: 1, y: 0 },
						{ x: -1, y: 1 },
						{ x: 0, y: 1 },
					],
					{ x: 0 },
				),
			)
			.toEqual([1, 0.4999999999999999]);
		bro
			.expect(
				roots(
					[
						{ x: -0.1, y: 0 },
						{ x: 1, y: 0 },
						{ x: -1, y: 1 },
						{ x: 0.2, y: 1 },
					],
					{ x: 0 },
				),
			)
			.toEqual([0.933000169651692, 0.03337036105888136, 0.5098199454799027]);
	});
});

bro.test("sibling position", () => {
	bro
		.expect(siblingPosition({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }))
		.toEqual({ x: 0, y: 0 });
	bro
		.expect(siblingPosition({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }))
		.toEqual({ x: 2, y: 0 });
	bro
		.expect(siblingPosition({ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }))
		.toEqual({ x: 6.123233995736766e-17, y: 2 });
	bro
		.expect(siblingPosition({ x: 0, y: 1 }, { x: 0, y: 0 }, { x: 1, y: 0 }))
		.toEqual({ x: -1.8369701987210297e-16, y: -1 });
	bro
		.expect(siblingPosition({ x: 0.1, y: 1 }, { x: 0, y: 0 }, { x: 1, y: 0 }))
		.toEqual({ x: -0.09950371902099893, y: -0.9950371902099892 });
	bro
		.expect(siblingPosition({ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 1 }))
		.toEqual({ x: 1, y: 0 });
	bro
		.expect(siblingPosition({ x: 1, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 1 }))
		.toEqual({ x: -1, y: 1.2246467991473532e-16 });
});

bro.test("simple evaluation function", () => {
	bro
		.expect(
			evaluate(
				[
					{ x: 0, y: 0 },
					{ x: 0, y: 0 },
					{ x: 1, y: 1 },
					{ x: 1, y: 1 },
				],
				0,
			),
		)
		.toEqual({ x: 0, y: 0 });
	bro
		.expect(
			evaluate(
				[
					{ x: 0, y: 0 },
					{ x: 0, y: 0 },
					{ x: 1, y: 1 },
					{ x: 1, y: 1 },
				],
				1,
			),
		)
		.toEqual({ x: 1, y: 1 });
	bro
		.expect(
			evaluate(
				[
					{ x: 0, y: 0 },
					{ x: 1, y: 1 },
					{ x: 0, y: 0 },
					{ x: 1, y: 1 },
				],
				0,
			),
		)
		.toEqual({ x: 0, y: 0 });
	bro
		.expect(
			evaluate(
				[
					{ x: 0, y: 0 },
					{ x: 1, y: 1 },
					{ x: 0, y: 0 },
					{ x: 1, y: 1 },
				],
				1,
			),
		)
		.toEqual({ x: 1, y: 1 });
	bro
		.expect(
			evaluate(
				[
					{ x: 0, y: 0 },
					{ x: 1, y: 0 },
					{ x: 0, y: 1 },
					{ x: 1, y: 1 },
				],
				0.2,
			),
		)
		.toEqual({ x: 0.3920000000000001, y: 0.10400000000000004 });
	bro
		.expect(
			evaluate(
				[
					{ x: 0, y: 0 },
					{ x: 1, y: 0 },
					{ x: 0, y: 1 },
					{ x: 1, y: 1 },
				],
				0.33,
			),
		)
		.toEqual({ x: 0.48034799999999994, y: 0.254826 });
	bro
		.expect(
			evaluate(
				[
					{ x: 0, y: 0 },
					{ x: 1, y: 0 },
					{ x: 0, y: 1 },
					{ x: 1, y: 1 },
				],
				0.5,
			),
		)
		.toEqual({ x: 0.5, y: 0.5 });
	bro
		.expect(
			evaluate(
				[
					{ x: 0, y: 0 },
					{ x: 1, y: 0 },
					{ x: 0, y: 1 },
					{ x: 1, y: 1 },
				],
				0.9,
			),
		)
		.toEqual({ x: 0.7560000000000001, y: 0.9720000000000001 });
	bro
		.expect(
			evaluate(
				[
					{ x: 0, y: 0 },
					{ x: 1, y: 0 },
					{ x: 0, y: 1 },
					{ x: 1, y: 1 },
				],
				-0.2,
			),
		)
		.toEqual({ x: -0.8720000000000001, y: 0.136 });
	bro
		.expect(
			evaluate(
				[
					{ x: 0, y: 0 },
					{ x: 1, y: 0 },
					{ x: 0, y: 1 },
					{ x: 1, y: 1 },
				],
				1.5,
			),
		)
		.toEqual({ x: 4.5, y: 0 });
});
