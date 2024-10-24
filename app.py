from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/pl')
def polish():
    return render_template('index-pl.html')

@app.route('/ua')
def ukrainian():
    return render_template('index-ua.html')

@app.route('/ro')
def romanian():
    return render_template('index-ro.html')

@app.route('/de')
def germany():
    return render_template('index-de.html')

if __name__ == '__main__':
    app.run(debug=True)
