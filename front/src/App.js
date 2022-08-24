import logo from './logo.svg';
import './App.css';
import React from 'react';
import axios from 'axios';
const { io } = require("socket.io-client");

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
      <div className="Lggin">
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
  }
  render()
  {
    return (
       <h1>PageChat</h1>
    );
  }
};

class App extends React.Component {
  constructor(props)
  {
    super( props );
    this.state = {page: "Loggin", is_log: false, error_longin42: false, socket : null};
    this.socket = null;
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
          this.setState({is_log: true, page: "Game", jwt: res.data.access_token});
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
    this.socket = io("http://localhost:3000", {
      extraHeaders: {
        Authorization: "Bearer " + tok,
      }
    });
                  
    this.socket.on("connect", (data) => {
        console.log("connect: " + this.state.jwt);
    });
  }
  get_all_room()
  {
    this.socket.emit("get_all_room").then((data) => {
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
      page_content = <PageChat/>;
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