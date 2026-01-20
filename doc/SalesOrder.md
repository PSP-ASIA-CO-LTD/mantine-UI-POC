# Sales Order
Sales order can be created by using Package details, selected start date, selected room, customize personal items (like medicine or diapers, etc.) primary contact, etc. and crammed into A4-Invoice format document

1. user select package
2. user gives their personal data as guardian(s)
3. user gives resident's data, and asked to keep resident's ID card
4. user select room which also bump package price, also any customization, which will be calculated into invoice.
5. invoice page where user can select payment channels

## in invoice page
- show an A4-paper-like design with company letterhead placeholder. then 
- add guardian who pays as invoicee address (back to contact info, add a checkboxk to guardian information to check which guardian pays, just a checkbox. if other guardians pay in the future we can check the checkbox later so we know that more than one guardian supports this resident
- give details of the recent package, if info were skipped yet not input, show gray placeholder area
- table of package and prices with business owner's signature (create a signature image into business table)
- add buttons, payment channel (Promptpay QR code, bank account numbers (KBank, SCB, Bangkok Bank, Krungthai bank), credit card (open form modal to add last 4 number of card.
- after payment has been made manually, sales can check next from invoice page to land on contract page
