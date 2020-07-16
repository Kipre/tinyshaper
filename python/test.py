import unittest
import numpy as np
from surf import *

class TestBezierCurve(unittest.TestCase):

	curve1 = BezierCurve(np.array([[1, 2], [2, 3], [4, 2], [2, 1]]))
	curve2 = BezierCurve(np.array([[0.  , 1.29], [0.22, 1.15], [0.33, 0.9 ], [0.5 , 1.  ]]))

	def test_isin(self):
		self.assertTrue(self.curve1.is_in(1.5, axis=0))
		self.assertTrue(self.curve1.is_in(1.5, axis=1))
		self.assertFalse(self.curve1.is_in(2.5, axis=0))
		self.assertFalse(self.curve1.is_in(2.5, axis=1))

	def test_evaluate(self):
		np.testing.assert_almost_equal(self.curve1.evaluate(0.3), np.array([2.035, 2.414]))
		np.testing.assert_almost_equal(self.curve2.evaluate(0.3), np.array([0.17289, 1.14672]))


	def test_split(self):
		c1, c2 = self.curve2.split(0.5322265625)
		assembling = np.concatenate((c1.points(), c2.points()[1:]))
		np.testing.assert_almost_equal(assembling, np.array([[0.        , 1.29      ],
														     [0.10291016, 1.22451172],
														     [0.18175099, 1.13495412],
														     [0.25392277, 1.06841024],
														     [0.33603888, 0.99269748],
														     [0.40952148, 0.94677734],
														     [0.5       , 1.        ]]))

	def test_transform(self):
		np.testing.assert_almost_equal(self.curve1.transform(0.5, 1.5, 0.1, 0.3).points(), np.array([[0.6, 3.3], 
			                                                                                       [1.1, 4.8], 
			                                                                                       [2.1, 3.3], 
			                                                                                       [1.1, 1.8]]))

	def test_reversed(self):
		np.testing.assert_almost_equal(self.curve1.reversed().points(), np.array([[2, 1], [4, 2], [2, 3], [1, 2]]))

	def test_equality(self):
		self.assertTrue(self.curve1.equals(BezierCurve(np.array([[1, 2], [2, 3], [4, 2], [2, 1]]))))
		self.assertFalse(self.curve1.equals(BezierCurve(np.array([[1, 2], [2, 3], [4, 3], [2, 1]]))))



class TestBezierPath(unittest.TestCase):

	path1 = BezierPath(np.array([[1, 2], [2, 3], [4, 2], [2, 1]]))
	path2 = BezierPath(np.array([[1, 2], [2, 3], [4, 2], [2, 1], [6, 8], [5, 6], [7, 9]]))

	def test_get(self):
		self.assertEqual(self.path1.get(0.1), [])

	def test_transform(self):
		np.testing.assert_almost_equal(self.path1.transform(-1, 1, 0, 0).points(), 
			                           BezierPath(np.array([[-1, 2], [-2, 3], [-4, 2], [-2, 1]])).points())

	def test_equality(self):
		self.assertTrue(self.path1.equals(BezierPath(np.array([[1, 2], [2, 3], [4, 2], [2, 1], [6, 8], [5, 6], [7, 9]]))))
		self.assertFalse(self.path1.equals(BezierPath(np.array([[1, 2], [2, 3], [4, 3], [2, 1], [6, 8], [5, 6], [7, 9]]))))

	def test_reversed(self):
		pass


	# def test_project_two_sides(self):
	# 	print(self.path1.project(10, True))




if __name__ == '__main__':
	unittest.main()
