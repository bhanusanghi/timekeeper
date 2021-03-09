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

  const ourContractAddress = "0x60F26b793d1774FF0A36012550c9907f7D2785aE";
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

  let userAddress = props.address.toString().toLowerCase();

  const GET_MEMBER_DETAILS = gql`
    query Members($userAddress: ID!) {
      members(where: { id: $userAddress }) {
        id
        address
        role
        approver {
          id
        }
        loggedActivities {
          id
          activityType
          isApproved
          numberOfHours
          startTimestamp
        }
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
        let d = new Date(parseInt(timestamp));
        return d.getDate() + "/" + d.getMonth() + "/" + d.getFullYear() + " " + d.getHours() + ":" + d.getMinutes();
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
    pollInterval: 1000,
  });

  console.log("data");
  console.log(data);

  return (
    <>
      {props.signer && userAddress ? (
        <div className="pg-wrapper">
          <div className="logging-form-wrapper">
            <div className="form-header">
              <p>Your Address: {loading === undefined || loading === true ? "loading..." : props.address}</p>
              <p>
                Activity Approver:
                {loading === undefined || loading === true || !data.members[0]
                  ? "loading..."
                  : data.members[0].approver.id}
              </p>
              <p>
                Role:
                {loading === undefined || loading === true || !data.members[0] ? "loading..." : data.members[0].role}
              </p>
            </div>
            <div>
              {loading === undefined || loading === true || !data.members[0] ? (
                "loading..."
              ) : (
                <>
                  <Space direction="vertical" size={5}></Space>
                  <h3>Activity Log</h3>
                  <Table columns={tableColumns} dataSource={data.members[0].loggedActivities} />
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        "No Signer or user address missing"
      )}
    </>
  );
}
export default ActivityHistory;
