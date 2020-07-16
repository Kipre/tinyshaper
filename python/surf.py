import numpy as np
import matplotlib.pyplot as plt
import json

class BezierCurve:
    
    def __init__(self, points):
        [self.a, self.b, self.c, self.d] = np.array(points, dtype=np.float64)

    def bounds(self, axis):
        values = self.points()[:, axis]
        return min(values), max(values)
        
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
    
    def get_t(self, x, axis=0):
        l, h = 0, 1
        el = self.evaluate(l)[axis] - x
        eh = self.evaluate(h)[axis] - x

        if el * eh > 0:
            return np.nan
        else:
            while abs(l - h) > 0.001:
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
        pos = lambda t, a, b: a*t + b*(1-t)
        b12 = pos(t, self.b, self.c)
        b11 = pos(t, self.a, self.b)
        b13 = pos(t, self.c, self.d)
        b22 = pos(t, b11, b12)
        b23 = pos(t, b12, b13)
        b33 = pos(t, b22, b23)
        return BezierCurve([self.a, b11, b22, b33]), BezierCurve([b33, b23, b13, self.d])
    
    def is_in(self, x, axis=0):
        if self.a[axis] < x and self.d[axis] > x:
            return True
        elif self.a[axis] > x and self.d[axis] < x:
            return True
        else:
            return False

    def plot(self, nb_points=50, ax=None):
        if ax:
            ax.plot(*self.project(nb_points).T)   
        else:
            plt.plot(*self.project(nb_points).T)
            plt.scatter(*self.points().T)
        

    def transform(self, scale_x, scale_y, translate_x, translate_y):
        factors = np.array([scale_x, scale_y], dtype=np.float32)
        bias = np.array([translate_x, translate_y], dtype=np.float32)
        return BezierCurve([self.a * factors + bias, 
        	                self.b * factors + bias, 
        	                self.c * factors + bias, 
        	                self.d * factors + bias])

    def reversed(self):
        return BezierCurve([self.d, self.c, self.b, self.a])

    def __str__(self):
        return f'Bezier curve through:\n{self.points()}'

    def equals(self, other):
        return (self.points() == other.points()).all()




class BezierPath:
    
    def __init__(self, points):
        self.curves = []
        for k in range((len(points)-1)//3):
            self.curves.append(BezierCurve(points[k*3:(k+1)*3 + 1]))

    def get(self, x, axis=0):
        points = []
        for curve in self.curves:
            t = curve.get_t(x, axis)
            if not np.isnan(t):
                points.append(curve.evaluate(t))
        return points
        
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


    def plot(self, ax=None):
        for curve in self.curves:
            curve.plot(ax=ax)

    def transform(self, scale_x, scale_y, translate_x, translate_y):
        result = BezierPath([])
        result.curves = [curve.transform(scale_x, scale_y, translate_x, translate_y) for curve in self.curves]
        return result

    def project(self, nb_points, two_sides=False):
        result = []
        for curve in self.curves:
            result.extend(curve.project(nb_points))
        if two_sides:
            for curve in self.transform(-1, 1, 0, 0).reversed().curves:
                result.extend(curve.project(nb_points))
        return np.array(result)

    def reversed(self):
        result = BezierPath([])
        result.curves = [curve.reversed() for curve in reversed(self.curves)]
        return result

    def equals(self, other):
        result = True
        for curve1, curve2 in zip(self.curves, other.curves):
            result *= curve1.equals(curve2)
        return result
            

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
            result[i, 0] = self.z_paths[i].get(x)[0][1]
            result[i, 1] = self.y_paths[i].get(x)[0][1]
        return BezierPath(result)

    def get_obj(self, slices=30, points_per_curve=15):
        '''Get board as .obj formatted string'''

        xs = (1 - np.cos(np.pi * np.linspace(0, 1, slices)))/2

        result = 'o board'
        verticles = '\n'
        indexes = '\n'

        all_points = []
        for x in xs:
            points = self.get_cut(x).project(points_per_curve, True)
            all_points.extend(np.c_[points, np.full(len(points), x)] * np.array([self.width, self.thickness, self.length]))
        all_points = np.array(all_points)

        nb_points_per_slice = len(points)

        for point in all_points:
            verticles += f' \nv {point[0]} {point[1]} {point[2]}'
            
        d = list(range(1, nb_points_per_slice + 1)) + [1]

        for slic in range(len(xs) - 1):
            for n, m in zip(d, d[1:]):
                indexes += f' \nf {n + nb_points_per_slice * slic} {m + nb_points_per_slice * slic} {n + nb_points_per_slice * (slic + 1)}'
                indexes += f' \nf {m + nb_points_per_slice * slic} {n + nb_points_per_slice * (slic + 1)} {m + nb_points_per_slice * (slic + 1)}'
                
        return result + verticles + indexes



        
        
