export interface IEmailJob {
  email: string;
}

export interface IVerifyEmailJob extends IEmailJob {
  token: string;
}

export interface IOrderTrackingLinkJob extends IEmailJob {
  url: string;
  orderCode: string;
}
