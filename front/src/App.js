import logo from './logo.svg';
import './App.css';
import React from 'react';
import axios from 'axios';
import jwt_decode from 'jwt-decode';

const { io } = require("socket.io-client");
 
var socket;
var username = "John";

class PageLoggin extends React.Component
{
  constructor(props) 
  {
    super(props);
    this.state = {name: "", password: "", etat: "not_loggin"};
  }
  change_username(e)
  {
    const val = e.target.value;
    this.setState({name: val});
  }
  change_password(e)
  {
    const val = e.target.value;
    this.setState({password: val});
  }
  async loggin()
  {
    //const data = {username: this.state.name, password: this.state.password};
    const  data = "username=" + this.state.name + "&password=" + this.state.password;
    console.log("username=" + this.state.name + "&password=" + this.state.password);
    try {
      const response = await axios.post("http://localhost:3000/auth", data, {headers: {'Access-Control-Allow-Origin': '*',}}).catch((err) => {return (false)});
      console.log(response.data);
      const token = response.data.access_token;
      this.props.setToken(token);
      return (true);
    } catch (error) {
      return (false);
    }
  }
  render()
  {
    let content;
    if (this.state.error_longin42)
      content = <p>Error loggin 42 User : Try later.</p>;
    else if (this.state.etat == "error_loggin")
      content = <p>Error loggin: username or password not correct.</p>;
    return (
      <div className="PageLoggin">
       <h1>PageLoggin</h1>
       {content}
       <input type="textarea" onChange={this.change_username.bind(this)}/>
       <input type="password" onChange={this.change_password.bind(this)}/>
       <button onClick={this.loggin.bind(this)}>Loggin</button>
       <a href="https://api.intra.42.fr/oauth/authorize?client_id=7e2bea32b8d407dab9d25b1ab4ff8ec14118a99e50807a191bc47334ed598658&redirect_uri=http%3A%2F%2Flocalhost%3A3001&response_type=code"><button>Connect with 42</button></a>
      </div>
    );
  }
};

class PageProfile extends React.Component
{
  constructor(props) 
  {
    super(props);
  }
  render()
  {
    return (
       <h1>PageProfile</h1>
    );
  }
};

class PageGame extends React.Component
{
  constructor(props) 
  {
    super(props);
  }
  render()
  {
    return (
       <h1>PageGame</h1>
    );
  }
};

class PageChat extends React.Component
{
  constructor(props) 
  {
    super(props);
    this.state = {room: [], messages: []};
    this.text_info = "";
    this.rooms = [];
    this.messages = [];
    this.id = 0;
    socket.emit("get_my_rooms");
    socket.on("get_my_rooms", (data) => {
        console.log(data);
        this.rooms = [];
        for (let n of data)
        {
          if (!(n in this.rooms))
          {
            this.rooms.push(n);
          }
        }
        this.setState({room: this.rooms});
    });
    socket.on("get_message_room", (data) => {
      this.messages = data;
      this.setState({messages: data});
    });
  }
  addRoom()
  {
	  //NAME, IS_PASSWORD_PROTECTED, PASSWORD
    const name = document.getElementById("newRoom").value;
    const is_password_protected = false;
    const password = "";
    try
    {
        socket.emit("new_room", { room_name: name, is_password_protected: is_password_protected, password: password}, () => {
        socket.emit("get_my_rooms");
      });
    }
    catch(e) {  this.text_info = "Room already exist.";}
  }
  getAllMessages(room)
  {
    socket.emit("get_message_room", {room_name: room});
  }
  render()
  {
    console.log(username);
    console.log(this.messages);
    return (
      <div className='pageRoom'>
        <h1>PageChat</h1>
        <p>{this.text_info}</p>
        <input type="textarea" id="newRoom"></input>
        <button onClick={this.addRoom.bind(this)}>+</button>
        <div className='MessageRoom'>
          <ul class="ul_room">
            {this.rooms.map((room) => { return (<button className='BtnRoom' onClick={this.getAllMessages.bind(this, room) }>{room}</button>)})}
          </ul>
          <ul className='ul_messages'>
            {this.messages.map((room) => { return (<p className={room.id_user.username == username ? 'ul_message_me' : 'ul_message_other'}>{room.content_message}</p>)})}
          </ul>
        </div>
      </div>
    );
  }
};

class App extends React.Component {
  constructor(props)
  {
    super( props );
    this.state = {page: "Loggin", is_log: false, error_longin42: false, socket : null};
  }
  componentDidMount() {
    const queryParams = new URLSearchParams(window.location.search);
    const code = queryParams.get('code');
    if (code != null && this.state.page == "Loggin")
    {
      console.log(code);
      try{  
        axios.post("http://localhost:3000/auth42","username=oui&password=" + code)
        .then(res => {
          console.log(res.data);
          this.setToken(res.data.access_token);
          console.log("conv : ", jwt_decode(res.data.access_token + "jwt token"));
        }).catch((err) => {this.setState({error_longin42: true})});
      }catch (error) {
        this.setState({error_longin42: true});
      }
    }
  }
  change_page(page)
  {
    this.setState(() => ({page: page}));
  }
  setToken(tok)
  {
    this.setState({is_log: true, page: "Game", jwt: tok}); 
		socket = io("http://localhost:3000",{
      extraHeaders: {
        Authorization: "Bearer " + tok,
      }
    });
                  
    socket.current.on("connect", (data) => {
        console.log("connect: " + this.state.jwt);
    });
  }
  get_all_room()
  {
    socket.emit("get_all_room").then((data) => {
      return (data);
    });
  }
  render(){
    let page_content;
    if (this.state.page === "Loggin")
      page_content = <PageLoggin error42={this.error_longin42} setToken={(tok) => this.setToken(tok)}/>;
    else if (this.state.page === "Profile")
      page_content = <PageProfile/>;
    else if (this.state.page === "Game")
      page_content = <PageGame/>;
    else if (this.state.page === "Chat")
      page_content = <PageChat socket={this.state.socket}/>;
    else
      page_content = <h1>Page not found</h1>;
    if (this.state.is_log == true){
      return (
        <div className="App">
          <nav>
            <div className="BTN_OTHER">
              <button onClick={this.change_page.bind(this, "Game")}>Game</button>
              <button onClick={this.change_page.bind(this, "Chat")}>Chat</button>
            </div>
            <div className="BTN_PROFILE">
              <button onClick={this.change_page.bind(this, "Profile")}>Profile</button>
            </div>
          </nav>
          <div className='Page'>
            {page_content}
          </div>
        </div>
      );
    }
    else
    {
      return (
        <div className="App">
          <div className='Page'>
            {page_content}
          </div>
        </div>
      );
    }
  }
}

export default App;