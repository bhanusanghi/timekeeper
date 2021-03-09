# Welcome to TimeKeeper!

Hi! I am Bhanu. Please go through the readme to understand the app, how to set it up in your system and how to interact with it. 

## About

Timekeeper is a solution for DAOs to enable their timesheets and payments.
Users can create roles, and create members with those roles.
Users can log their activities. An activity can range from Coding, Marketing, Break, Team meeting etc to any other activity you would like to log.
Users select the type of Activity, add number of hours and the start time.
You can map members to other members with the relation Approver to approve these filled Activity Timesheets.
Users can checkout their activities in the Logged Activities tab.
Once Approved these timesheets can be further used to automate payments.

This is currently in a POC stage and for creating a larger solution I need to further understand the operations in dOrg. 
Demo link - https://www.youtube.com/watch?v=X6DaodcpBoU

## Quick Start

required: [Node](https://nodejs.org/dist/latest-v12.x/) plus [Yarn](https://classic.yarnpkg.com/en/docs/install/) and [Git](https://git-scm.com/downloads)
```bash
git clone https://github.com/bhanusanghi/timekeeper.git
cd timekeeper
```

```bash
yarn install
```

  

```bash
yarn start
```
## How it works
The contract is storing information of members, their approvers, their logged activities and the status of these logged activities.
The subgraph indexes all this info and powers the FrontEnd data.

## Usage Instructions

Once you have started the app. Go to http://localhost:3000 

> For ease please use this burner address with your metamask, for the POC.
  Account: 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
  Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
  
Log into your metmask and select the test network **Ropsten**
You will see 4 tabs 

 - **Log Activity** - Use this to Log New Activities.
 - **Logged Activities** - Here you can find the history of all your personal logged activities.
 - **Approve** - Select a user account that you are an approver of from the dropdown. His activity logs are shown there and can be approved for from here.
 - **Members** - Checkout the members of the platform and add new members.

## Next Steps

 1. Understand the workings of dOrg further and create a model for an ideal Timesheet Management Solution.
 2. Create and share that proposal containing the model with DAO.
 3. Change the current project to the specifications of the Model.
 4. Design the Product Experience and get to its implementation.

