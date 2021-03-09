import React, { useState, useEffect } from "react";
import { Input, Button, Space, DatePicker, Table, Tag } from "antd";
import "./activity-history.css";
import { useQuery, gql } from "@apollo/client";
import fetch from "isomorphic-fetch";
import abi from "../contracts/TimeKeeper.abi";
import { ethers } from "ethers";

function Members(props) {
  const ourContractAddress = "0x60F26b793d1774FF0A36012550c9907f7D2785aE";
  const timekeeperContract = new ethers.Contract(ourContractAddress, abi, props.signer);

  let userAddress = props.address.toString();
  const GET_MEMBER_DETAILS = gql`
    {
      members(orderBy: createdAt) {
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
      title: "Member",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "Approver",
      dataIndex: "approver",
      key: "approver",
      render: approver => approver.id,
    },
  ];

  const { loading, error, data } = useQuery(GET_MEMBER_DETAILS);
  const [newMemberAddress, updateNewMemberAddress] = useState("");
  const [newMemberRole, updateNewMemberRole] = useState("");

  console.log("data");
  console.log(data);
  return (
    <>
      {props.signer && userAddress ? (
        <div className="pg-wrapper">
          <div className="logging-form-wrapper">
            <div className="form-header">
              <p>Your Address: {loading ? "loading..." : props.address}</p>
              <p>Activity Approver: {loading ? "loading..." : data.members[0] ? data.members[0].approver.id : "NA"}</p>
              <p>Role: {loading ? "loading..." : data.members[0] ? data.members[0].role : "NA"}</p>
            </div>
            <div>
              {loading ? (
                "loading..."
              ) : (
                <>
                  <Space direction="vertical" size={5}>
                    <h3>Add New Member</h3>
                    <div>
                      <Space direction="horizontal" size={5}>
                        <label>Address</label>
                        <Input
                          size="small"
                          value={newMemberAddress}
                          onChange={e => updateNewMemberAddress(e.target.value)}
                        />
                        <label>Role</label>
                        <Input size="small" value={newMemberRole} onChange={e => updateNewMemberRole(e.target.value)} />
                        <Button
                          type="primary"
                          onClick={async () => {
                            await timekeeperContract.addMember(newMemberAddress, newMemberRole);
                            data.refetch();
                          }}
                          size="small"
                        >
                          Add Member
                        </Button>
                      </Space>
                    </div>
                    <hr />
                    <h3>DAO Members</h3>
                    {data.members && data.members.length > 0 ? (
                      <Table columns={tableColumns} dataSource={data.members} />
                    ) : (
                      "No members indexed yet"
                    )}
                  </Space>
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
export default Members;
