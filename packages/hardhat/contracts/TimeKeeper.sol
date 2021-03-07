pragma solidity >=0.6.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";

contract TimeKeeper {
    event LogActivity(
        uint256 activityId,
        address member,
        string activityType,
        uint256 numberOfHours,
        uint256 startTimestamp,
        uint256 endTimestamp
    );
    event ApproveActivity(uint256 activityId);
    event UpdateApprover(address member, address newApprover);
    // event Payout(address member, Activity Activity);

    struct Activity {
        uint256 activityId;
        string activityType;
        bool isApproved;
        bool isPaid;
        uint256 numberOfHours;
        uint256 startTimestamp;
        uint256 endTimestamp;
    }

    mapping(address => mapping(uint256 => Activity)) public loggedActivities;

    mapping(address => address) public approver;

    mapping(address => string) public members;

    uint256 nextActivityId = 0;

    constructor() {
        //initialize current members of DAO.
    }

    function addMember(address userAddress, string memory role) public {
        //check if a current member is adding it or not.
        require(
            members[msg.sender] != string("0x00"),
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

    function logActivity(
        string memory activityType,
        uint256 numberOfHours,
        uint256 startTimestamp,
        uint256 endTimestamp
    ) public returns (bool) {
        require(
            members[msg.sender] != string("0x00"),
            "This operation can only be carried out by current members of DAO"
        );
        Activity memory activity =
            Activity(
                nextActivityId,
                activityType,
                false,
                false,
                numberOfHours,
                startTimestamp,
                endTimestamp
            );
        loggedActivities[msg.sender][nextActivityId] = activity;
        emit LogActivity(
            nextActivityId,
            msg.sender,
            false,
            false,
            activityType,
            numberOfHours,
            startTimestamp,
            endTimestamp
        );
        nextActivityId++;
        return true;
    }

    function approveActivity(member, uint256 activityId) public {
        require(
            approver[member] == msg.sender,
            "This operation can only be carried out by the approver of the member"
        );
        loggedActivities[msg.sender][nextActivityId].isApproved = true;
        emit ApproveActivity(activityId);
    }
}
