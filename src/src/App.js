import React, {Component} from 'react';
import './App.css';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import {Container, Form, Button, Table} from 'react-bootstrap';
import web3 from './web3';
import ipfs from './ipfs';
import storehash from './contracts/Verification.json';
import $ from 'jquery';

class App extends Component {
  state = {
      account: '0x0',
      loading: true,
      msg: '0x0',
      signature: '0x0',
      web3: null,
      ipfsHash: null,
      buffer:'',
      ethAddress:'',
      blockNumber:'',
      transactionHash:'',
      gasUsed:'',
      txReceipt: ''   
    }  

    componentDidMount = async () => {
      try{
        var contract = require('truffle-contract');
        var Instance = contract(storehash);
        Instance.setProvider(web3.currentProvider); 
        const accounts = await web3.eth.getAccounts();
        const account = accounts[0];
        this.setState({web3: web3, account}, this.getData);             
        this.setState({ethAddress: '0xE2553736f9FEd68Ab8Bb7A311cdE5217592A59F7' });
        $('#signature').hide();
        $('#invite_url').hide();
      }

      catch(error){
        console.log(error)
      }
    }

    captureFile =(event) => {
      event.stopPropagation()
      event.preventDefault()
      const file = event.target.files[0]
      let reader = new window.FileReader()
      reader.readAsArrayBuffer(file)
      reader.onloadend = () => this.convertToBuffer(reader)
    };

    convertToBuffer = async(reader) => {
      const bfr = await Buffer.from(reader.result);
      console.log(bfr);
      this.setState({buffer: bfr});
    };

    onClick = async (event) => {      
      try {
        event.preventDefault();
        this.setState({blockNumber: 'Waiting...', gasUsed: 'waiting...'});
        console.log(this.state.transactionHash);
        await web3.eth.getTransactionReceipt(this.state.transactionHash,(err,txReceipt) => {console.log(err,txReceipt);
          this.setState({txReceipt});
        });
        console.log(this.state.txReceipt.blockNumber);
        await this.setState({blockNumber: this.state.txReceipt.blockNumber});
        await this.setState({gasUsed: this.state.txReceipt.gasUsed});
        $('#invite_url').show();    
      }
      catch(error){
        console.log(error);
      }
    }

    onSubmit = async (event) => {
      event.preventDefault();
      const accounts = await web3.eth.getAccounts();
      await ipfs.add(this.state.buffer, (err, ipfsHash) => {
        this.setState({ipfsHash: ipfsHash[0].hash});      
        const Hash = new web3.eth.Contract(storehash.abi, '0x54Cf40a61994eCaE67CEBF36e7DcEC4293c91211')  
        Hash.methods.sendHash(this.state.ipfsHash).send({from: accounts[0]}, (error, transactionHash) => {
          this.setState({transactionHash});
          $('#signature').show();
        });
      })
    }
  /*

  getData = async => {
    console.log("getData");
      const {account, loading} = this.state ;   
      console.log("account:"+ account + "loadin:"+ loading);
      if(loading){
        $("#loader").hide();
        $("#content").show();
      }
  }
  */
  signMessage = async(event) => {
    event.preventDefault();
    const {web3, account, ipfsHash } = this.state;
    const ipfs_hex = web3.utils.asciiToHex(ipfsHash);
    const id = web3.utils.sha3(ipfs_hex, Date.now());
    const Hash = new web3.eth.Contract(storehash.abi, '0x54Cf40a61994eCaE67CEBF36e7DcEC4293c91211')  
    Hash.methods.addDocument(id, ipfs_hex).send({from: account});
    this.onClick(event);
    
    // const sign_page_url = 'sign';
    // const url = 'window.location.href' + sign_page_url + '/?id=' + id + '&ipfs=' + ipfsHash;  
    // $("#invite_url .card-body").append('<p><a href="'+url+ '">'+ url + '</p>');

  }

  render() {
    
  return (
    <div className="App">
      <header >
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0">
          <a className="navbar-brand col-sm-3 col-md-2 mr-0" >Ethereum IPFS Upload and Document Sign</a>
          <ul className="navbar-nav px-3">
            <li className="nav-item text-nowrap">
              <small><a className="nav-link " >Your Account: <div id="account" ><span >{this.state.account}</span></div></a></small>
            </li>
          </ul>
        </nav>
      </header>
      
      <Container>
        <div className="row">
          <div className="col-sm-12">
            <div className="card bg-light mb-3 mx-auto">
              <div className="card-header">
                <h3> <p className="font-weight-bold">Step:1</p> Choose file to send to IPFS </h3>
              </div>
              <div className="card-body">   
                <Form onSubmit={this.onSubmit} >
                  <input 
                    type = "file"
                    onChange = {this.captureFile}
                  />
                  <Button variant="primary" type="submit"> 
                      Send it 
                  </Button>
                </Form>
              </div>
            </div>
            {/* <Button onClick = {this.onClick}> Get Transaction Receipt </Button> */}
            
          </div>              
        </div>  

        <div className="raw" id="signature">
          <div className="col-sm-12">
            <div className="card bg-light mb-3 mx-auto">
              <div className="card-header">
                <h3> <p className="font-weight-bold">Step:2</p> Sign the document </h3>
              </div>
              <div className="card-body">  
                <Button onClick = {this.signMessage}> I Agree </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="raw" id="invite_url">
          <div className="col-sm-12">
            <div className="card bg-light mb-3 mx-auto">
              <div className="card-header">
                <h3> <p className="font-weight-bold">Step:3</p> Transaction Receipt </h3>
              </div>
              <div className="card-body">  
              <Table bordered responsive>
                  <thead>
                    <tr>
                      <th>Tx Receipt Category</th>
                      <th>Values</th>
                    </tr>
                  </thead>               
                  <tbody>
                    <tr>
                      <td>IPFS Hash # stored on Eth Contract</td>
                      <td>{this.state.ipfsHash}</td>
                    </tr>
                    <tr>
                      <td>Ethereum Contract Address</td>
                      <td>{this.state.ethAddress}</td>
                    </tr>
                    <tr>
                      <td>Tx Hash #</td>
                      <td>{this.state.transactionHash}</td>
                    </tr>                  
                    <tr>
                      <td>Block Number #</td>
                      <td>{this.state.blockNumber}</td>
                    </tr>                  
                    <tr>
                      <td>Gas Used</td>
                      <td>{this.state.gasUsed}</td>
                    </tr>                
                  </tbody>
              </Table>    
              </div>
            </div>
          </div>
        </div>
      </Container>
     


      {/* 
      <div className="container-fluid">
        <div className="row">
          <main role="main" className="col-md-9 ml-sm-auto col-lg-10">
            <div className="d-flex justify-content-between flex-wrap flex-md-nowrap pt-3 pb-2 mb-3 border-bottom" style={{marginTop: '40px'}}>
              <div id="loader">
                <p className="text-center">Loading...</p>
              </div>
              <div id="content" className="col-lg-9" style={{display: 'none'}}>
                <h2>Sign a Message</h2>
                <p>Sign a message from your account with the form below and broadcast it to the blockchain!</p>
                <form  className="" ref= "myForm" role="form" onSubmit={this.signMessage}>
                  <div className="form-group">
                    <input id="message" className="form-control" type="text"></input>
                  </div>
                  <button type="submit" className="btn btn-primary">Sign & Send</button>
                </form>
                <p id="msg">{this.msg}</p>
                <p id="signature">{this.signature}</p>
                <button id="verify" className="btn btn-primary" style={{display: 'none'}}> Verify Signature</button>
                <p id="address"></p>
              </div>
            </div>
          </main>
        </div>
      </div>*/}
    </div> 
  );
  }
}  
export default App;
