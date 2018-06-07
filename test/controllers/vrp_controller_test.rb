require 'test_helper'

class VrpControllerTest < ActionDispatch::IntegrationTest
  test "should get input" do
    get vrp_input_url
    assert_response :success
  end

  test "should get solve" do
    get vrp_solve_url
    assert_response :success
  end

end
