import logo from './logo.svg';
import './App.css';
import React from 'react';


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
    this.state = {page: "Profile", is_log: true};
    this.change_page_game = this.change_page_game.bind(this);
    this.change_page_profile = this.change_page_profile.bind(this);
    this.change_page_chat = this.change_page_chat.bind(this);
  }
  change_page(page)
  {
    this.setState(() => ({page: page}));
  }
  change_page_game()
  {
    this.setState(() => ({page: "Game"}));
  }
  change_page_profile()
  {
    this.setState(() => ({page: "Profile"}));
  }
  change_page_chat()
  {
    this.setState(() => ({page: "Chat"}));
  }
  render(){
    let page_content;
    if (this.state.page === "Profile")
      page_content = <PageProfile/>;
    else if (this.state.page === "Game")
      page_content = <PageGame/>;
    else if (this.state.page === "Chat")
      page_content = <PageChat/>;
    else
      page_content = <h1>Page not found</h1>;
    if (this.state.is_log === true){
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
      return (<h1>Loggin</h1>);
    }
  }
}



export default App;