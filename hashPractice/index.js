const express = require('express');
const mongoose = require('mongoose');
const app = express();
const User = require('./models/user');
const bcrypt = require('bcrypt');
const session = require('express-session');

mongoose.connect('mongodb://localhost:27017/auth')
.then(()=>{
    console.log('database connect');
})
.catch(err=>{
    console.log(err);
})

app.use(express());
app.use(session({
    secret: 'notagoodsecret',
    resave: true,
    saveUninitialized: true}));

app.set('view engine', 'ejs');
app.set('views', 'views');



app.use(express.urlencoded({extended:true}));//body 데이터 해석하기 위함

const requireLogin = (req, res, next) =>{
    if(!req.session.user_id){
        return res.redirect('/login');
    }
    next();
}


app.get('/', (req, res)=>{
    res.send('home')
})

app.get('/register', (req, res)=>{
    res.render('register');
})

app.post('/register', async(req, res)=>{
    const {username, password} = req.body;
    const hash = await bcrypt.hash(password, 12);//비밀번호로 해시
    const user = new User({
        username,//유저네임은 그대로
        password: hash//비밀번호는 해시해서
    });
    await user.save();//데이터베이스에 저장
    res.redirect('/login');
})
app.get('/login', (req, res)=>{
    res.render('login');
})
app.post('/login', async(req, res)=>{
    const {username, password} = req.body;
    const user = await User.findOne({username});//데이터베이스에서 username과 일치하는 데이터 찾아 저장
    let validPassword;
    if(user == null) validPassword = false;//아이디가 존재하지 않음
    else validPassword = await bcrypt.compare(password, user.password);//비밀번호 일치 불일치 여부 판단
    //입력받은 password와 데이터베이스 내부 password비교
    if(validPassword){
        req.session.user_id = user._id;//세션에 user_id할당 후 user컬렉션의 _id 저장
        res.redirect('/secret');
    }
    else{
        res.redirect('/login');
    }
})

app.post('/logout', async(req, res)=>{
    //req.session.user_id = null;//세션의 user_id프로퍼티 값을 null로
    req.session.destroy();//세션을 삭제
    res.redirect('login');
})



app.get('/secret', requireLogin, (req, res)=>{
    res.render('secret');
})


app.listen(3000, ()=>{
    console.log("3000 is connected");
})