pragma solidity >=0.6.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";

contract TimeKeeper {
    event LogHour(address member, Hour hour);
    event ApproveHour(address member, Hour hour);
    // event Payout(address member, Hour hour);

    struct Hour {
        string activityType;
        // bool isApproved;
        // bool isPaid;
        uint256 numberOfHours;
        uint256 startTimestamp;
        uint256 endTimestamp;
    }

    mapping(address => Hour[]) public loggedHours;
    mapping(address => Hour[]) public paidHours;
    mapping(address => Hour[]) public approvedHours;

    mapping(address => address) public approver;

    mapping(address => string) public members;

    constructor() {
        //initialize current members of DAO.
    }

    function addMember(address userAddress, string role) public {
        //check if a current member is adding it or not.
        require(
            members[msg.sender] != 0,
            "This operation can only be carried out by current members of DAO"
        );
        members[userAddress] = role;
    }

    function removeMember(address member) public {
        require(
            approver[member] == msg.sender,
            "This operation can only be carried out by the approver of the member"
        );
        delete members[userAddress];
    }

    function updateMemberTimesheetApprover(address member, address newApprover)
        public
    {
        require(
            approver[member] == msg.sender,
            "This operation can only be carried out by the approver of the member"
        );
        approver[member] = newApprover;
        // check if called by the current approveer otherwise ignore
    }

    function logHour(
        string activityType,
        uint256 numberOfHours,
        uint256 startTimestamp,
        uint256 endTimestamp
    ) public returns (bool) {
        require(
            members[msg.sender] != 0,
            "This operation can only be carried out by current members of DAO"
        );
        Hour memory hour =
            Hour(0, activityType, numberOfHours, startTimestamp, endTimestamp);
        loggedHours[msg.sender].push(hour);
        emit LogHour(msg.sender, hour);
        return true;
    }

    function approveHour(member, Hour hour) public {
        // require(
        //     approver[member] == msg.sender,
        //     "This operation can only be carried out by the approver of the member"
        // );
    }
}
