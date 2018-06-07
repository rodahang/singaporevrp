require 'test_helper'

class DashboardControllerTest < ActionDispatch::IntegrationTest
  test "should get home" do
    get dashboard_home_url
    assert_response :success
  end

  test "should get about" do
    get dashboard_about_url
    assert_response :success
  end

  test "should get research" do
    get dashboard_research_url
    assert_response :success
  end

end
