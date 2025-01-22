// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract Dappcord is ERC721 {
    address public owner;
    uint256 public totalChannels;
    uint256 public totalSupply;
    struct Channel {
        uint256 id;
        string name;
        uint256 cost;
    }
    mapping(uint256 => Channel) public channels;
    mapping(uint256 => mapping(address => bool)) public hasJoined; //channel id to address of user who has joined it or not

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    constructor(
        string memory _name,
        string memory _symbol
    ) ERC721(_name, _symbol) {
        owner = msg.sender;
    }

    function createChannel(
        string memory _name,
        uint256 _cost
    ) public onlyOwner {
        totalChannels++;
        channels[totalChannels] = Channel(totalChannels, _name, _cost);
    }

    function mint(uint256 _id) public payable {
        //_id is channel id
        require(_id != 0, "channel id must be greater than zero");
        require(
            _id <= totalChannels,
            "channel id must be less than total channels count"
        );
        require(
            hasJoined[_id][msg.sender] == false,
            "User have already joined this channel"
        );
        require(
            msg.value >= channels[_id].cost,
            "Cost for joined channel must be greater than equal to channel joining fee"
        );
        //JOIN CHANNEL
        hasJoined[_id][msg.sender] = true;
        //MINT NFT
        totalSupply++;
        _safeMint(msg.sender, totalSupply);
    }

    function getChannel(uint256 _id) public view returns (Channel memory) {
        return channels[_id];
    }
    function withdraw() public onlyOwner {
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success);
    }
}

