import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  // 1. 관리자 세션 확인
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. 환경 변수 확인
  let propertyId = process.env.GA4_PROPERTY_ID;
  let clientEmail = process.env.GA4_CLIENT_EMAIL;
  let privateKey = process.env.GA4_PRIVATE_KEY;

  // Private Key 전처리 (PEM 형식 재구성으로 안정성 확보)
  if (privateKey) {
    privateKey = privateKey.replace(/^"|"$/g, "");
    const header = "-----BEGIN PRIVATE KEY-----";
    const footer = "-----END PRIVATE KEY-----";
    let body = privateKey
      .replace(header, "")
      .replace(footer, "")
      .replace(/\\n/g, "")
      .replace(/\s/g, "");
    
    const pieces = body.match(/.{1,64}/g);
    if (pieces) {
      privateKey = `${header}\n${pieces.join("\n")}\n${footer}\n`;
    }
  }

  if (!propertyId || !clientEmail || !privateKey) {
    return NextResponse.json(
      { 
        error: "GA4 연동 설정이 완료되지 않았습니다.", 
        missing: { propertyId: !propertyId, clientEmail: !clientEmail, privateKey: !privateKey }
      },
      { status: 400 }
    );
  }

  try {
    const analyticsDataClient = new BetaAnalyticsDataClient({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
    });

    // 3. 데이터 요청
    const [mainReport, demographicReport] = await Promise.all([
      analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
        dimensions: [{ name: "date" }],
        metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }],
      }),
      analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
        dimensions: [{ name: "userAgeBracket" }, { name: "userGender" }, { name: "deviceCategory" }],
        metrics: [{ name: "activeUsers" }],
      }),
    ]);

    return NextResponse.json({
      main: mainReport[0],
      demographics: demographicReport[0],
    });
  } catch (error: any) {
    console.error("GA4 API Error:", JSON.stringify(error, null, 2));
    return NextResponse.json(
      { error: "구글 애널리틱스 데이터를 가져오는 중 오류가 발생했습니다.", details: error.message },
      { status: 500 }
    );
  }
}
