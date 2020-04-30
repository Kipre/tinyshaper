import numpy as np
import matplotlib.pyplot as plt
import json

class BezierCurve:
    
    def __init__(self, points):
        [self.a, self.b, self.c, self.d] = points
        
    def evaluate(self, t):
        inv = (1 - t)
        return inv**3 * self.a + \
               3*t * inv**2 * self.b + \
               3*t**2 * inv * self.c + \
               t**3 * self.d

    def project(self, nb_points=50):
        values = np.zeros((nb_points, 2))
        for i, t in enumerate(np.linspace(0, 1, nb_points)):
            values[i] = self.evaluate(t)
        return values

    def points(self):
        return np.array([self.a, self.b, self.c, self.d])
    
    def get_t(self, x, precision=0.001, axis=0):
        l, h = 0, 1
        el = self.evaluate(l)[axis] - x
        while abs(l - h) > precision:
            m = (l + h)/2
            em = self.evaluate(m)[axis] - x
            if el * em > 0:
                l = m
                el = em 
            else:
                h = m
                eh = em
        return m
    
    def split(self, t, axis=0):
        """http://web.mit.edu/hyperbook/Patrikalakis-Maekawa-Cho/node13.html"""
        b00, b01, b02, b03 = self.a, self.b, self.c, self.d
        pos = lambda t, a, b: a*t + b*(1-t)
        b12 = pos(t, b01, b02)
        b11 = pos(t, b00, b01)
        b13 = pos(t, b02, b03)
        b22 = pos(t, b11, b12)
        b23 = pos(t, b12, b13)
        b33 = pos(t, b22, b23)
        return BezierCurve([b00, b11, b22, b33]), BezierCurve([b33, b23, b13, b03])
    
    def is_in(self, x, axis=0):
        if self.a[axis] < x and self.d[axis] > x:
            return True
        elif self.a[axis] > x and self.d[axis] < x:
            return True
        else:
            return False

    def plot(self, nb_points=50):
        plt.plot(*self.project(nb_points).T)
        plt.scatter(*self.points().T)


class BezierPath:
    
    def __init__(self, points):
        self.curves = []
        for k in range((len(points)-1)//3):
            self.curves.append(BezierCurve(points[k*3:(k+1)*3 + 1]))

    def get(self, x, axis=0):
        for i, curve in enumerate(self.curves):
            if curve.is_in(x):
                break
        t = curve.get_t(x, axis=axis)
        return curve.evaluate(t)

        
    def add_point(self, x, axis=0):
        for i, curve in enumerate(self.curves):
            if curve.is_in(x):
                break
        curve = self.curves.pop(i)
        t = curve.get_t(x, axis=axis)
        c1, c2 = curve.split(1 - t, axis=axis)
        self.curves.insert(i, c2)
        self.curves.insert(i, c1)

    def points(self):
        result = [*self.curves[0].points()]
        for curve in self.curves[1:]:
            result.extend(curve.points()[1:])
        return np.array(result)

    def intercalate(self, factors, other):
        assert len(self) == len(other)
        assert len(factors) == len(self) + 1

        a = self.points()
        b = other.points()

        factors_array = np.ones_like(a)
        factors_array[:2] *= factors[0]
        for i, factor in enumerate(factors[1:-1]):
            factors_array[i*3 + 2:(i+1)*3 + 2] *= factor
        factors_array[-2:] *= factors[-1]

        in_between = a*(1-factors_array) + b*factors_array
        return BezierPath(in_between)

    def intercalate_zero(self, factors, axis=1):
        tmp  = self.points()
        tmp[:, axis] = 0
        other = BezierPath(tmp)
        return other.intercalate(factors, self)


    def plot(self):
        for curve in self.curves:
            curve.plot()

    def __len__(self):
        return len(self.curves)

class Board:

    def __init__(self, fname):
        with open(fname) as f:
            board = json.loads(f.read())
        self.x = BezierPath(np.array(board['x'])[:, :2])
        self.x0 = BezierPath(np.array(board['x0'])[:, :2])
        self.y_up = BezierPath(np.array(board['y'])[:7, :2])
        self.y_down = BezierPath(np.flipud(np.array(board['y']))[:7, :2])
        self.z = BezierPath(np.array(board['z'])[:, :2])
        self.length = board['length']
        self.width = board['width']
        self.thickness = board['thickness']
        self.x_cut = np.array(board['z'])[6, 0]
        self.x0_cut = np.array(board['z'])[3, 0]

        self.y_up.add_point(self.x0_cut)
        self.y_down.add_point(self.x0_cut)

        y_factors = [[a, a, b, b] for [_, a], [_, b] in zip(self.x0.points(), self.x.points())]
        self.y_paths = [self.y_down.intercalate(factors, self.y_up) for factors in y_factors]

        z_factors = [[a, a, b, b] for [a, _], [b, _] in zip(self.x0.points(), self.x.points())]
        self.z_paths = [self.z.intercalate_zero(factors) for factors in z_factors]

    def all(self):
        return [self.x, self.x0, self.y_up, self.y_down, self.z]

    def plot_2d(self):
        for path in self.all():
            path.plot()

    def get_cut(self, x):
        result = np.zeros((len(self.x.points()), 2))
        for i, val in enumerate(result):
            result[i, 0] = self.z_paths[i].get(x)[1]
            result[i, 1] = self.y_paths[i].get(x)[1]
        return BezierPath(result)

        
        
