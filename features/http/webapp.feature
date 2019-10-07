Feature: 
  title: Robot Web Browser

Scenario: Google on Firefox

  Given I use firefox browser
  When I visit /
  When I type meta4qa-api into q
  When I click btnG
  When I wait until page is meta4qa-api - Google Search
  Then I stop using browser
  Then dump
