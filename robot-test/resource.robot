*** Settings ***
Documentation     A resource file with reusable keywords and variables.
...
...               The system specific keywords created here form our own
...               domain specific language. They utilize keywords provided
...               by the imported Selenium2Library.
Library           Selenium2Library

*** Variables ***
${SERVER}         localhost:9090
${BROWSER}        safari
${DELAY}          0.5
${VALID USER}     teemuki
${VALID PASSWORD}    salakala
${LOGIN URL}      http://${SERVER}/#login

*** Keywords ***
Open Browser To Login Page
    Open Browser    ${LOGIN URL}    ${BROWSER}
    Maximize Browser Window
    Set Selenium Speed    ${DELAY}
    Wait Until Page Contains Element    login

Receipt List View Should Be Open
    Page Should Contain Element    list-menu

Receipt Edit View Should Be Open
    Page Should Contain Element    receipt-edit-form

Receipt View Should Be Open
    Page Should Contain Elemnt    receipt-view-form

Go To Login Page
    Go To    ${LOGIN URL}
    Login Page Should Be Open

Input Username
    [Arguments]    ${username}
    Input Text    username    ${username}

Input Password
    [Arguments]    ${password}
    Input Text    password    ${password}

Submit Credentials
    Click Button    css=.login-btn

Open Browser To Login Page And Do Login
    Open Browser To Login Page
    Input Username    ${VALID USER}
    Input Password    ${VALID PASSWORD}
    Submit Credentials

