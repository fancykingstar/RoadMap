export const staging = false;
export const baseURL = staging ? (window.location.origin+"/srv_api/odata/v4/roadmap/Roadmap") :
  // 'https://roadmap-ui-dev.cfapps.sap.hana.ondemand.com/srv_api/' // app-router route
  'https://roadmap-srv-dev.cfapps.sap.hana.ondemand.com/odata/v4/roadmap/Roadmap'
