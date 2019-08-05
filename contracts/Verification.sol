pragma solidity 0.5.0;

contract Verification{
    string ipfsHash;
     struct Document {
        uint timestamp;
        bytes ipfs_hash;
        address[] signatures;
    }
mapping(address => bytes[]) public users; 
mapping(bytes32 => Document) public documents; 

    function addDocument(bytes memory _id, bytes memory _ipfs) public {
        users[msg.sender].push(_ipfs); 
        address[] memory sender = new address[](1);
        sender[0] = msg.sender;
        documents[keccak256(_id)] = Document(block.timestamp, _ipfs, sender);
    }

    function sendHash(string memory x) public {
        ipfsHash = x;
    }
    function getHash() public view returns(string memory x){
        return ipfsHash;
    }


}