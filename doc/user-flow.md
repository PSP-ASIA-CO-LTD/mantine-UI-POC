overview
1. business setup --- subflow: from business information to complete setup, then land on dashboard
2. create department --- subflow: click create department, add department basic info, add service (service has subflow: add service detail, number of days in the week, can CRUD), department created
3. create (add) staff --- subflow: click add staff, add staff basic info, add employment info, add professional info, staff created
4. create package --- subflow: click add package, add package basic info, add service related to this package,package created
5. create sales order --- subflow: click create sales order, select package and add start date, add contact info (guardian, resident), select room and additional service, invoice created by system, put payment info into payment channel, contract created by system, print out for user to sign, order completed
6. system create staff task --- subflow: system read pakage data, system address start date, system starts to lay down the tasks as registered into the package into staff task calendar system, staff can see their tasks from the calendar system view.