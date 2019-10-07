@target=localhost

Feature: Verify that TCP port tests are working

  Scenario: Test Ports are open/closed

    When port 22 at 127.0.0.1 is open
    When port 23 at 127.0.0.1 is closed
    When port 22 is open
    When port 23 is closed
    Then I pass
