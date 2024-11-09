from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_wtf.csrf import CSRFProtect
from datetime import datetime, timedelta
import os

app = Flask(__name__)
app.secret_key = 'YOUR_CUSTOM_SECRET_KEY_CAUSE_THIS_IS_UNSECURE'
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URI', 'sqlite:///users.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
csrf = CSRFProtect(app)

MAX_LOGIN_ATTEMPTS = 3
LOGIN_COOLDOWN_TIME = 5
login_attempts = {}
login_cooldowns = {}

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=True)
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
        return render_template(f'/translations/index/index-{lang_code}.html')
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
        last_name = data.get('lastname')
        email = data['email']
        password = data['password']

        if len(password) < 8:
            return jsonify({"message": "Password must be at least 8 characters long."}), 400
        
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

        try:
            birthday = datetime.strptime(data['birthday'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({"message": "Invalid date provided for birthday."}), 400

        today = datetime.today().date()
        age = today.year - birthday.year - ((today.month, today.day) < (birthday.month, birthday.day))

        if age < 13:
            return jsonify({"message": "You must be at least 13 years old to register."}), 400

        if User.query.filter_by(email=email).first():
            return jsonify({"message": "Email is already registered."}), 409

        new_user = User(first_name=first_name, last_name=last_name, email=email, password=hashed_password, birthday=birthday)
        db.session.add(new_user)
        db.session.commit()

        session['user_id'] = new_user.id
        session.permanent = True
        return jsonify({"message": "User registered successfully."}), 201
    except Exception as e:
        return jsonify({"message": "Error during registration.", "error": str(e)}), 400

@app.route('/api/login', methods=['POST'])
def api_login():
    global login_attempts, login_cooldowns
    email = request.json.get('email')
    password = request.json.get('password')

    if email in login_cooldowns and datetime.now() < login_cooldowns[email]:
        return jsonify({"message": f"Too many login attempts. Please try again in {LOGIN_COOLDOWN_TIME} minutes."}), 429

    if email in login_attempts and login_attempts[email] >= MAX_LOGIN_ATTEMPTS:
        login_cooldowns[email] = datetime.now() + timedelta(minutes=LOGIN_COOLDOWN_TIME)
        return jsonify({"message": "Too many login attempts. Please try again later."}), 429

    user = User.query.filter_by(email=email).first()
    if user and bcrypt.check_password_hash(user.password, password):
        session['user_id'] = user.id
        session.permanent = True
        login_attempts.pop(email, None)
        return jsonify({"message": "Login successful."}), 200

    if email in login_attempts:
        login_attempts[email] += 1
    else:
        login_attempts[email] = 1

    return jsonify({"message": "Invalid email or password."}), 401

@app.route('/api/logout', methods=['POST'])
def api_logout():
    session.pop('user_id', None)
    return jsonify({"message": "Logged out successfully."}), 200

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        first_name = request.form['first_name']
        last_name = request.form.get('last_name')
        email = request.form['email']
        password = request.form['password']

        if len(password) < 8:
            return "Password must be at least 8 characters long."

        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

        try:
            birthday = datetime.strptime(request.form['birthday'], '%Y-%m-%d').date()
        except ValueError:
            return "Invalid date provided for birthday. Please enter a valid birthday."

        new_user = User(first_name=first_name, last_name=last_name, email=email, password=hashed_password, birthday=birthday)
        db.session.add(new_user)
        db.session.commit()
         
        session['user_id'] = new_user.id
        session.permanent = True
        return redirect(url_for('index'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        
        if email in login_cooldowns and datetime.now() < login_cooldowns[email]:
            return "Too many login attempts. Please try again later.", 429

        if email in login_attempts and login_attempts[email] >= MAX_LOGIN_ATTEMPTS:
            login_cooldowns[email] = datetime.now() + timedelta(minutes=LOGIN_COOLDOWN_TIME)
            return "Too many login attempts. Please try again later.", 429

        user = User.query.filter_by(email=email).first()
        if user and bcrypt.check_password_hash(user.password, password):
            session['user_id'] = user.id
            session.permanent = True
            login_attempts.pop(email, None)
            return redirect(url_for('index'))

        if email in login_attempts:
            login_attempts[email] += 1
        else:
            login_attempts[email] = 1

    return render_template('login.html')

@app.route('/logout')
def logout():
    session.pop('user_id', None)
    return redirect(url_for('index'))

@app.route('/home')
def home():
    return render_template('home.html')

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)