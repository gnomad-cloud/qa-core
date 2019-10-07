feature: 
  title: 404: Page Not Found
scenarios: 
  title: 404
  steps:
  - Given I enable redirects
  - When I GET http://localhost/404/not/found
  - Then response code should be 404
