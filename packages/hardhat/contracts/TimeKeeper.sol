pragma solidity >=0.6.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";

contract TimeKeeper {
    event LogHour(
        address member,
        string activityType,
        uint256 numberOfHours,
        uint256 startTimestamp,
        uint256 endTimestamp
    );
    event UpdateApprover(
        address member,
        string activityType,
        uint256 numberOfHours,
        uint256 startTimestamp,
        uint256 endTimestamp
    );
    event ApproveHour(
        address member,
        string activityType,
        uint256 numberOfHours,
        uint256 startTimestamp,
        uint256 endTimestamp
    );
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

    function addMember(address userAddress, string memory role) public {
        //check if a current member is adding it or not.
        require(
            !StringUtils.equal(members[msg.sender], ""),
            "This operation can only be carried out by current members of DAO"
        );
        members[userAddress] = role;
    }

    function removeMember(address member) public {
        require(
            approver[member] == msg.sender,
            "This operation can only be carried out by the approver of the member"
        );
        delete members[member];
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
        string memory activityType,
        uint256 numberOfHours,
        uint256 startTimestamp,
        uint256 endTimestamp
    ) public returns (bool) {
        require(
            !StringUtils.equal(members[msg.sender], ""),
            "This operation can only be carried out by current members of DAO"
        );
        Hour memory hour =
            Hour(activityType, numberOfHours, startTimestamp, endTimestamp);
        loggedHours[msg.sender].push(hour);
        emit LogHour(
            msg.sender,
            activityType,
            numberOfHours,
            startTimestamp,
            endTimestamp
        );
        return true;
    }

    // function approveHour(member, Hour hour) public {
    // require(
    //     approver[member] == msg.sender,
    //     "This operation can only be carried out by the approver of the member"
    // );
    // }
}
