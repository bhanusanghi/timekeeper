import { BigInt, Address } from "@graphprotocol/graph-ts";
import {
  LogActivity,
  ApproveActivity,
  UpdateApprover,
  AddMember,
} from "../generated/TimeKeeper/TimeKeeper";

import { Activity, Member } from "../generated/schema";

export function handleLogActivity(event: LogActivity): void {
  let memberAddress = event.params.member.toHexString();
  let activityType = event.params.activityType.toString();
  let isApproved = event.params.isApproved;
  let isPaid = event.params.isPaid;
  let numberOfHours = event.params.numberOfHours;
  let startTimestamp = event.params.startTimestamp;
  let endTimestamp = event.params.endTimestamp;
  let activityId = event.params.activityId;

  let activity = new Activity(activityId.toString());
  let member = Member.load(memberAddress);
  if (!member) return;
  activity.activityId = activityId;
  activity.activityType = activityType;
  activity.member = memberAddress;
  activity.isApproved = isApproved;
  activity.isPaid = isPaid;
  activity.numberOfHours = numberOfHours;
  activity.startTimestamp = startTimestamp;
  activity.endTimestamp = endTimestamp;
  activity.createdAt = event.block.timestamp;
  activity.transactionHash = event.transaction.hash.toHex();
  activity.save();
}

export function handleApproveActivity(event: ApproveActivity): void {
  let activityId = event.params.activityId.toString();
  let activity = Activity.load(activityId);
  if (activity == null) return;
  activity.isApproved = true;
  activity.approvedBy = event.params.approvedBy.toHexString();
  activity.approvedOn = event.block.timestamp;
  activity.save();
}

export function handleUpdateApprover(event: UpdateApprover): void {
  let memberAddress = event.params.member.toHexString();
  let currentApproverAddress = event.params.currentApprover.toHexString();
  let newApproverAddress = event.params.newApprover.toHexString();
  let member = Member.load(memberAddress);
  let previousApprover = Member.load(currentApproverAddress);
  let newApprover = Member.load(newApproverAddress);
  if (member !== null && newApprover !== null) {
    member.approver = newApproverAddress;
    member.save();
  }

  // previousApprover.approvees.splice(
  //   previousApprover.approvees.findIndex(
  //     (approvee) => (approvee.address = memberAddress)
  //   ),
  //   1
  // );
  // previousApprover.save();
  // newApprover.approvees.push(memberAddress);
  // newApprover.save();
}

export function handleAddMember(event: AddMember): void {
  let memberAddress = event.params.member.toHexString();
  let addedBy = event.params.addedBy.toHexString();
  let role = event.params.role.toString();
  let member = Member.load(memberAddress);
  if (member == null) {
    member = new Member(memberAddress);
    member.address = event.params.member;
    member.role = role;
    member.approver = addedBy;
    member.addedBy = addedBy;
    member.lastPaidAt = null;
    member.createdAt = event.block.timestamp;
    member.save();
  }
}

// export function handleSetPurpose(event: SetPurpose): void {
//   let senderString = event.params.sender.toHexString();

//   let sender = Sender.load(senderString);

//   if (sender == null) {
//     sender = new Sender(senderString);
//     sender.address = event.params.sender;
//     sender.createdAt = event.block.timestamp;
//     sender.purposeCount = BigInt.fromI32(1);
//   } else {
//     sender.purposeCount = sender.purposeCount.plus(BigInt.fromI32(1));
//   }

//   let purpose = new Purpose(
//     event.transaction.hash.toHex() + "-" + event.logIndex.toString()
//   );

//   purpose.purpose = event.params.purpose;
//   purpose.sender = senderString;
//   purpose.createdAt = event.block.timestamp;
//   purpose.transactionHash = event.transaction.hash.toHex();

//   purpose.save();
//   sender.save();
// }
