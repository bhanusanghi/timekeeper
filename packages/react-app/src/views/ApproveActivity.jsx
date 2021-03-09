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

  const ourContractAddress = "0x60F26b793d1774FF0A36012550c9907f7D2785aE";
  const timekeeperContract = new ethers.Contract(ourContractAddress, abi, props.signer);

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
        approvees {
          id
        }
        loggedActivities {
          activityType
          isApproved
          numberOfHours
          startTimestamp
          activityId
        }
      }
    }
  `;

  const [getApproveeData, ...approveeData] = useLazyQuery(GET_MEMBER_DETAILS, { pollInterval: 1000 });

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
      key: "actions",
      render: (text, record) => (
        <Button
          size="small"
          type="primary"
          onClick={async () => {
            let tx = await timekeeperContract.approveActivity(props.address, record.activityId);
            await tx.wait();
            // approveeData[0].refetch();
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

  const getApproveeOptions = () => {
    let options = data.members[0].approvees.map(approvee => {
      return { label: approvee.id, value: approvee.id };
    });
    return options;
  };

  console.log(approveeData);
  console.log(data);
  // console.log(loadingApproveeData);
  return (
    <>
      {props.signer && userAddress ? (
        <div className="pg-wrapper">
          <div className="logging-form-wrapper">
            <div className="form-header">
              <p>Your Address: {loading ? "loading..." : props.address}</p>
              <p>Activity Approver: {loading ? "loading..." : data.members[0].approver.id}</p>
              <p>Role: {loading ? "loading..." : data.members[0].role}</p>
              <p>
                Select Approvee:{" "}
                {loading ? (
                  "loading..."
                ) : (
                  <Select
                    size="large"
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
              {
                approveeData && !approveeData[0].loading && approveeData[0].data ? (
                  <>
                    <Space direction="vertical" size={5}></Space>
                    <h3>Activity Log</h3>
                    <Table columns={tableColumns} dataSource={approveeData[0].data.members[0].loggedActivities} />
                  </>
                ) : selectedApprovee === "" ? (
                  "Select an account to approve their activities"
                ) : (
                  "loading"
                )
                // "loading..."
              }
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
export default ApproveActivity;
