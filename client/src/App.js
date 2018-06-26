import React, { Component } from 'react';
import SimpleBarChart from './Chart';
import { 
  Container, 
  Button, 
  Form, 
  FormGroup, 
  Label, 
  Input,
  Navbar,
  NavbarBrand,
  } from 'reactstrap';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {accountAndRepo: 'superfly/fly', user: 'mrkurt', score: '', issuesJson: {}, chartData:  null};

    this.handleRepoChange = this.handleRepoChange.bind(this);
    this.handleUserChange = this.handleUserChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  updataResponse(issuesJson) {
    if(!issuesJson.issuesWithSentiments) {
      this.setState({ score: '', issuesJson: {}, chartData:  null });
      alert(`Sorry, couldn't analyze`);
      return;
    }
    const chartData = issuesJson.issuesWithSentiments.map(obj => {
      const score = obj.sentiment.score;
      const name = 'Issue #' + obj.issue.url.split('/').pop();
      return { name, score}

    })
    this.setState({ score: issuesJson.score, issuesJson: issuesJson, chartData: chartData });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    fetch('/sentiment', {
      method: 'post',
      body: JSON.stringify({
        user: this.state.user,
        accountAndRepo: this.state.accountAndRepo
      }),
      headers: {
        'content-type': 'application/json'
      }
    })
      .then(res => res.json())
      .then(issuesJson => this.updataResponse(issuesJson));
  }

  handleRepoChange(e) {
    this.setState({ accountAndRepo: e.target.value });
  }

  handleUserChange(e) {
    this.setState({ user: e.target.value });
  }

  render() {
    return (
      <div>
        <Navbar color="dark" className="navbar navbar-dark bg-dark box-shadow" expand="md">
          <NavbarBrand href="/">Sentiment analyzer</NavbarBrand>
        </Navbar>
        <Container>
          <div className="App">
            <div style={{marginTop:'100px'}}/>
              <Container>
                <div className="row justify-content-md-center"> 
                <Form inline onSubmit={this.handleSubmit}>
                  <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                    <Label for="Repo" className="mr-sm-2">Github Account/Repo: </Label>
                    <Input 
                    type="text" 
                    name="Repo" 
                    id="Repo"           
                    value={this.state.accountAndRepo} 
                    onChange={this.handleRepoChange} 
                    placeholder="Enter Github <account>/<repo>" />
                  </FormGroup>
                  <FormGroup  className="mb-2 mr-sm-2 mb-sm-0">
                  <Label for="IssueCreator" className="mr-sm-2">Issue Creator:  </Label>
                  <Input 
                    type="text" 
                    name="IssueCreator" 
                    id="IssueCreator"           
                    value={this.state.user} 
                    onChange={this.handleUserChange} 
                    placeholder="Github username" />
                  </FormGroup>
                  <Button type="submit" color="primary">Analyze</Button>
                  </Form>           
              </div>
              <div style={{marginTop:'100px'}}/>
              <h1>Avg. Score is:</h1>
              <h4 style={{color:'green'}}>{this.state.score}</h4>
              <div className="row justify-content-md-center"> 
                <SimpleBarChart data={this.state.chartData}/>
              </div>
              </Container>
            </div>
        </Container>
      </div>
    );
  }
}

export default App;
