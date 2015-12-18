from flask import Flask, render_template
import csv
from flask_restful import Resource, Api, reqparse

app = Flask(__name__)
api = Api(app)

parser = reqparse.RequestParser()
parser.add_argument('left', type=float)
parser.add_argument('bottom', type=float)
parser.add_argument('right', type=float)
parser.add_argument('top', type=float)


def within(left, bottom, right, top, point):
    return left <= point[0] <= right and bottom >= point[1] >= top


class IPData(Resource):
    def get(self):
        data = []
        args = parser.parse_args()

        skip, skip_amt = 0, 0
        with open('data/final_data.csv', 'rb') as csvfile:
            read = csv.DictReader(csvfile, delimiter=',')
            for row in read:
                if skip != 0:
                    skip -= 1
                    continue
                pos = [float(row['lat']), float(row['lng'])]
                if within(args['left'], args['bottom'], args['right'],
                          args['top'], pos):
                    # pos = [lat, lng] and count for heat map intensity
                    data.append([pos[0], pos[1], int(row['count'])])
                    if len(data) > 9500:
                        skip_amt += 1
                        skip = skip_amt
        return data


@app.route('/')
def hello_world():
    return render_template('index.html')


api.add_resource(IPData, '/get_ips/api/v1.0')

if __name__ == '__main__':
    app.run()
