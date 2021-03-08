import React, { useState, useEffect } from "react";
import { Input, Select, Space, DatePicker, Table, Tag } from "antd";
import "./activity-history.css";
import { useQuery, gql } from "@apollo/client";
import fetch from "isomorphic-fetch";
import abi from "../contracts/TimeKeeper.abi";
import { ethers } from "ethers";

function ActivityHistory(props) {
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
        loggedActivities
      }
    }
  `;

  const tableColumns = [
    {
      title: "Activity Type",
      dataIndex: "activityType",
      key: "name",
    },
    {
      title: "Duration(Hours)",
      dataIndex: "numberOfHours",
      key: "numberOfHours",
    },
    {
      title: "Start Time",
      dataIndex: "startTimestamp",
      key: "startTimestamp",
      render: timestamp => {
        let d = new Date(timestamp);
        return (
          d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear() + " " + d.getHours() + ":" + d.getMinutes()
        );
      },
    },
    {
      title: "Status",
      dataIndex: "isApproved",
      key: "isApproved",
      render: isApproved => (
        <Tag color={isApproved ? "green" : "geekblue"}> {isApproved ? "Approved" : "Pending Approval"} </Tag>
      ),
    },
  ];

  const { loading, error, data } = useQuery(GET_MEMBER_DETAILS, {
    variables: {
      userAddress,
    },
  });

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
            <div>
              {loading ? (
                "loading..."
              ) : (
                <>
                  <Space direction="vertical" size={5}></Space>
                  <h3>Activity Log</h3>
                  (<Table columns={tableColumns} dataSource={data.members[0].loggedActivities} />
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
export default ActivityHistory;
