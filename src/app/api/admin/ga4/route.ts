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
  const propertyId = process.env.GA4_PROPERTY_ID;
  const clientEmail = process.env.GA4_CLIENT_EMAIL;
  const privateKey = process.env.GA4_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!propertyId || !clientEmail || !privateKey) {
    return NextResponse.json(
      { error: "GA4 연동 설정이 완료되지 않았습니다. 환경 변수를 확인해 주세요." },
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

    // 3. 데이터 요청 (실시간 사용자, 연령대, 성별, 기기 등)
    // 참고: GA4 API는 한 번에 여러 쿼리를 보낼 수 없으므로 Promise.all 사용
    const [mainReport, demographicReport] = await Promise.all([
      // 기본 지표 (7일간의 추이)
      analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
        dimensions: [{ name: "date" }],
        metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }],
      }),
      // 인구통계 (연령, 성별) - 30일 데이터
      analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
        dimensions: [{ name: "ageBracket" }, { name: "userGender" }, { name: "deviceCategory" }],
        metrics: [{ name: "activeUsers" }],
      }),
    ]);

    return NextResponse.json({
      main: mainReport[0],
      demographics: demographicReport[0],
    });
  } catch (error: any) {
    console.error("GA4 API Error:", error);
    return NextResponse.json(
      { error: "구글 애널리틱스 데이터를 가져오는 중 오류가 발생했습니다.", details: error.message },
      { status: 500 }
    );
  }
}
