@target=google

Feature: Test DNS

  Scenario: Lookup DNS for google target for IPv4 and IPv6
    Given I am resolving-target-dns
    When I lookup DNS
    Then any $.addresses..address in dns must match 216.58.
    And any $..family in dns.addresses must match 4
    And any $.addresses..family in dns must match 6

  Scenario: Lookup DNS for google.com for IPv4 and IPv6
    Given I am resolving-dns
    When I lookup DNS for google.com
    Then any $.addresses..address in dns must match 216.58.
    And any $.addresses..family in dns must match 4
    And any $..family in dns.addresses must match 6

  Scenario: Resolve A record for google.com
    Given I am resolving-dns-A-record
    When I resolve DNS A record for google.com
    Then I dump this.dns

  Scenario: Resolve all DNS for google.com
    Given I am resolving-dns-all-records
    When I resolve DNS for google.com
    Then any $.A..addresses in dns must match 216.58.
    Then any $.AAAA..addresses in dns must match 2404:6800:
    Then any $.MX..addresses..exchange in dns must match google.com
