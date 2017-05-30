*** Settings ***
Documentation     A test suite with a single test for valid login.
...
...               This test has a workflow that is created using keywords in
...               the imported resource file.
Resource          resource.robot

*** Variables ***
${RECEIPT NAME}    XDXDXDXD
${RECEIPT PRICE}   20
${RECEIPT PURCHASEDATE}   01.01.2017
${RECEIPT REGISTERED}   29.01.2017
${RECEIPT WARRANTLY END DATE}   06.01.2017
${RECEIPT STORE}    Superkauppa
${RECEIPT TAG}    LagiTagi

*** Test Cases ***
Create Receipt
    Open Browser To Login Page And Do Login
    Receipt List View Should Be Open
    Click Link    receipt-new
    Wait Until Page Contains Element    receipt-edit-form
    Receipt Edit View Should Be Open
    Input Text    name    ${RECEIPT NAME}
    Input Text    purchaseDate    ${RECEIPT PURCHASEDATE}
    Focus    name
    Input Text    registered    ${RECEIPT REGISTERED}
    Focus    name
    Input Text    warrantlyEndDate    ${RECEIPT WARRANTLY END DATE}
    Focus    store
    Input Text    store    ${RECEIPT STORE}
    Input Text    price    ${RECEIPT PRICE}
    Input Text    css=.bootstrap-tagsinput>input     ${RECEIPT TAG}
    Press Key     css=.bootstrap-tagsinput>input     \\13
    Click Element     save2
    Wait Until Page Contains Element    receipt-view-form
    Element Should Contain    name   ${RECEIPT NAME}
    Element Should Contain    purchaseDate    ${RECEIPT PURCHASEDATE}
    Element Should Contain    registered    ${RECEIPT REGISTERED}
    Element Should Contain    warrantlyEndDate    ${RECEIPT WARRANTLY END DATE}
    Element Should Contain    store    ${RECEIPT STORE}
    Element Should Contain    price    ${RECEIPT PRICE}
    Click Link    edit
    Wait Until Page Contains Element    receipt-edit-form
    Click Link    delete
    Wait Until Page Contains Element    confirmation-dialog
    Click Element     ok
    [Teardown]    Close Browser
