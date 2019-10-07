Feature TLS

  @target=google
  Scenario: Google's Public X.509 Certificate

    Given I am testing google-x509-identity
    When I get a server certificate
    Then server certificate must be authorized
    And this.peer.authorized must match true
    And this.peer.state must match authorized
    And $.peer.cert.subject.CN must match google.com
    And $.subject.CN in this.peer.cert must match google.com
    And $.subject.O in this.peer.cert must match Google Inc
    And $.subject.L in this.peer.cert must match Mountain View
    And $.subject.ST in this.peer.cert must match California
    And $.subject.C in this.peer.cert must match US
