import React, { useState, useEffect } from "react";
import { Input, Button, Space, DatePicker } from "antd";
import "./time-logger.css";
import { useQuery, gql } from "@apollo/client";
import fetch from "isomorphic-fetch";
import abi from "../contracts/TimeKeeper.abi";
import { ethers } from "ethers";

function TimeLogger(props) {
  const [activityType, updateActivityType] = useState("");
  const [hours, updateHours] = useState(0);
  const [startTime, updateStartTime] = useState(0);
  const [endTime, updateEndTime] = useState(0);

  const ourContractAddress = 0x1e389a99c3a5670d3882dbd75898a69877d7a835;
  const timekeeperContract = new ethers.Contract(ourContractAddress, abi, props.signer);

  const updateHoursValue = e => {
    let hoursValue = e.target.value;
    updateHours(hoursValue);
    if (startTime !== 0) {
      updateEndTime(startTime + hoursValue * 60 * 60);
    }
  };
  const updateActivityTypeValue = e => {
    let activityType = e.target.value;
    updateActivityType(activityType);
  };

  let userAddress = props.address;

  const GET_MEMBER_DETAILS = gql`
    query Members($userAddress: String!) {
      members(address: $userAddress) {
        id
        address
        role
        approver
        addedBy
      }
    }
  `;

  const { loading, error, data } = useQuery(GET_MEMBER_DETAILS, {
    variables: {
      userAddress,
    },
  });
  function onChange(value, dateString) {
    console.log("Selected Time: ", value);
    updateStartTime(value.unix());
    updateEndTime(value.unix() + hours * 60 * 60);
    console.log("Formatted Selected Time: ", dateString);
  }

  async function logActivity() {
    if (activityType !== "" && hours !== 0 && startTime !== 0) {
      let isAcivityAdded = await timekeeperContract.logActivity(activityType, hours, startTime, endTime);
      if (!isAcivityAdded) {
        alert("Could not log activity");
      }
    } else alert("One or more fields are missing relevant data");
  }
  return (
    <>
      {props.signer && userAddress ? (
        <div className="pg-wrapper">
          <div className="logging-form-wrapper">
            <div className="form-header">
              <p>Your Address: {loading ? "loading..." : data.members[0].address}</p>
              <p>Activity Approver: {loading ? "loading..." : data.members[0].approver.id}</p>
              <p>Role: {loading ? "loading..." : data.members[0].role}</p>
            </div>
            {loading ? (
              "loading..."
            ) : (
              <div>
                <Space direction="vertical" size={5}>
                  <h3>Log new Activity</h3>
                  <label>Activity Type</label>
                  <Input value={activityType} onChange={updateActivityTypeValue} />
                  <label>Number of Hours</label>
                  <Input value={hours} onChange={updateHoursValue} type="number" />
                  <label>Time</label>
                  <DatePicker showTime onChange={onChange} />
                  <Button onClick={logActivity}>Log </Button>
                </Space>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
export default TimeLogger;
