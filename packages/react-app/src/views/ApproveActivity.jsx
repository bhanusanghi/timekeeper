import React, { useState, useEffect } from "react";
import { Input, Select, Space, DatePicker, Table, Tag, Button } from "antd";
// import "./activity-history.css";
import { useQuery, useLazyQuery, gql } from "@apollo/client";
import fetch from "isomorphic-fetch";
import abi from "../contracts/TimeKeeper.abi";
import { ethers } from "ethers";
const { Option } = Select;

function ApproveActivity(props) {
  const [selectedApprovee, updateSelectedApprovee] = useState("");

  const ourContractAddress = 0x1e389a99c3a5670d3882dbd75898a69877d7a835;
  const timekeeperContract = new ethers.Contract(ourContractAddress, abi, props.signer);

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
    {
      title: "Actions",
      dataIndex: "id",
      key: "actions",
      render: (id, record) => (
        <Button
          size="small"
          type="primary"
          onClick={async () => {
            await timekeeperContract.approveActivity(props.address, id);
            getApproveeData({ variables: { userAddress: selectedApprovee } });
          }}
          disabled={record.isApproved}
        >
          {record.isApproved ? "Approved" : "Approve"}
        </Button>
      ),
    },
  ];

  const { loading, error, data } = useQuery(GET_MEMBER_DETAILS, {
    variables: {
      userAddress,
    },
  });

  const [getApproveeData, { loadingApproveeData, approveeData }] = useQuery(GET_MEMBER_DETAILS, {
    variables: {
      userAddress,
    },
  });

  const getApproveeOptions = () => {
    let options = data.members[0].approvees.map(approvee => {
      return { label: approvee.id, value: approvee.id };
    });
    return options;
  };

  return (
    <>
      {props.signer && userAddress ? (
        <div className="pg-wrapper">
          <div className="logging-form-wrapper">
            <div className="form-header">
              <p>Your Address: {loading ? "loading..." : data.members[0].address}</p>
              <p>Activity Approver: {loading ? "loading..." : data.members[0].approver.id}</p>
              <p>Role: {loading ? "loading..." : data.members[0].role}</p>
              <p>
                Select Approvee:{" "}
                {loading ? (
                  "loading..."
                ) : (
                  <Select
                    onChange={approvee => {
                      updateSelectedApprovee(approvee);
                      getApproveeData({ variables: { userAddress: approvee } });
                    }}
                    options={getApproveeOptions()}
                  />
                )}
              </p>
            </div>
            <div>
              {loadingApproveeData ? (
                "loading..."
              ) : (
                <>
                  <Space direction="vertical" size={5}></Space>
                  <h3>Activity Log</h3>
                  (<Table columns={tableColumns} dataSource={approveeData.members[0].loggedActivities} />
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
export default ApproveActivity;
