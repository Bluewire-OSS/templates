from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from datetime import datetime

app = Flask(__name__)
app.secret_key = 'skibiditoilet11'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)
    birthday = db.Column(db.Date, nullable=False)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/<lang_code>')
def language(lang_code):
    supported_languages = ['pl', 'ua', 'ro', 'de', 'es', 'hr']
    if lang_code in supported_languages:
        return render_template(f'index-{lang_code}.html')
    return render_template('languages.html')

@app.route('/languages')
def languages():
    return render_template('languages.html')

@app.route('/register')
def register_template():
    return render_template('register.html')

@app.route('/api/register', methods=['POST'])
def api_register():
    data = request.json
    try:
        first_name = data['firstname']
        last_name = data['lastname']
        email = data['email']
        password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
        birthday = datetime.strptime(data['birthday'], '%Y-%m-%d').date()
        
        if User.query.filter_by(email=email).first():
            return jsonify({"message": "Email is already registered."}), 409

        new_user = User(first_name=first_name, last_name=last_name, email=email, password=password, birthday=birthday)
        db.session.add(new_user)
        db.session.commit()

        session['user_id'] = new_user.id
        return jsonify({"message": "User registered successfully."}), 201
    except Exception as e:
        return jsonify({"message": "Error during registration.", "error": str(e)}), 400

@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()
    if user and bcrypt.check_password_hash(user.password, password):
        session['user_id'] = user.id
        return jsonify({"message": "Login successful."}), 200
    return jsonify({"message": "Invalid email or password."}), 401

@app.route('/api/logout', methods=['POST'])
def api_logout():
    session.pop('user_id', None)
    return jsonify({"message": "Logged out successfully."}), 200

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        first_name = request.form['first_name']
        last_name = request.form['last_name']
        email = request.form['email']
        password = bcrypt.generate_password_hash(request.form['password']).decode('utf-8')
        birthday = datetime.strptime(request.form['birthday'], '%Y-%m-%d').date()
        
        new_user = User(first_name=first_name, last_name=last_name, email=email, password=password, birthday=birthday)
        db.session.add(new_user)
        db.session.commit()
        
        session['user_id'] = new_user.id
        return redirect(url_for('index'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        
        user = User.query.filter_by(email=email).first()
        if user and bcrypt.check_password_hash(user.password, password):
            session['user_id'] = user.id
            return redirect(url_for('index'))

@app.route('/logout')
def logout():
    session.pop('user_id', None)
    return redirect(url_for('index'))

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
