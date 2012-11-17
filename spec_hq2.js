describe("what_result", function() {

  it("criticals when I roll a 1", function() {
    expect(what_result(20, 1)).toEqual(RESULT.CRITICAL);
  });
  it("fumbles when I roll a 20", function() {
    expect(what_result(20, 20)).toEqual(RESULT.FUMBLE);
  });
  it("succeeds when I roll a 10 with a skill of 15", function() {
    expect(what_result(15, 10)).toEqual(RESULT.SUCCESS);
  });
  it("fails when I roll a 16 with a skill of 15", function() {
    expect(what_result(15, 16)).toEqual(RESULT.FAILURE);
  });
});

describe("bump_up", function() {
  var rv;

  it("one-bumps a fumble to a failure", function() {
    rv = bump_up(RESULT.FUMBLE, 1);
    expect(rv.new_result).toEqual(RESULT.FAILURE);
    expect(rv.remainder).toEqual(0);
  });
  it("two-bumps a failure to a critical", function() {
    rv = bump_up(RESULT.FAILURE, 2);
    expect(rv.new_result).toEqual(RESULT.CRITICAL);
    expect(rv.remainder).toEqual(0);
  });
  it("doesn't one-bump a critical any higher than a critical", function() {
    rv = bump_up(RESULT.CRITICAL, 1);
    expect(rv.new_result).toEqual(RESULT.CRITICAL);
    expect(rv.remainder).toEqual(1);
  });

});

describe("bump_down", function() {
  it("one-bumps a success to a failure", function() {
    expect(bump_down(RESULT.SUCCESS, 1)).toEqual(RESULT.FAILURE);
  });
  it("two-bumps a success to a fumble", function() {
    expect(bump_down(RESULT.SUCCESS, 2)).toEqual(RESULT.FUMBLE);
  });
  it("two-bumps a failure to a fumble", function() {
    expect(bump_down(RESULT.FAILURE, 2)).toEqual(RESULT.FUMBLE);
  });
  it("doesn't one-bump a fumble any lower than a fumble", function() {
    expect(bump_down(RESULT.FUMBLE, 1)).toEqual(RESULT.FUMBLE);
  });

});

describe("what_victory (tie)", function() {
  it("natural fumbles return a tie", function() {
    expect(what_victory(RESULT.FUMBLE, 20, RESULT.FUMBLE, 20)).toEqual(VICTORY.TIE);
  });
  it("bumped-down fumbles return a tie", function() {
    expect(what_victory(RESULT.FUMBLE, 19, RESULT.FUMBLE, 2)).toEqual(VICTORY.TIE);
  });
  it("failures return a tie", function() {
    expect(what_victory(RESULT.FAILURE, 18, RESULT.FAILURE, 18)).toEqual(VICTORY.TIE);
  });
  it("success return a tie", function() {
    expect(what_victory(RESULT.SUCCESS, 4, RESULT.SUCCESS, 4)).toEqual(VICTORY.TIE);
  });
  it("criticals return a tie", function() {
    expect(what_victory(RESULT.CRITICAL, 1, RESULT.CRITICAL, 1)).toEqual(VICTORY.TIE);
  });
});

describe("what_victory (marginal defeat)", function() {
  it("two failures", function() {
    expect(what_victory(RESULT.FAILURE, 17, RESULT.FAILURE, 15)).toEqual(VICTORY.MARGINAL_DEFEAT);
  });
  it("two successes", function() {
    expect(what_victory(RESULT.SUCCESS, 10, RESULT.SUCCESS, 9)).toEqual(VICTORY.MARGINAL_DEFEAT);
  });
  it("two criticals", function() {
    expect(what_victory(RESULT.CRITICAL, 2, RESULT.CRITICAL, 1)).toEqual(VICTORY.MARGINAL_DEFEAT);
  });
});

describe("what_victory (minor defeat)", function() {
  it("fumble vs failure", function() {
    expect(what_victory(RESULT.FUMBLE, 20, RESULT.FAILURE, 15)).toEqual(VICTORY.MINOR_DEFEAT);
  });
  it("failure vs success", function() {
    expect(what_victory(RESULT.FAILURE, 15, RESULT.SUCCESS, 9)).toEqual(VICTORY.MINOR_DEFEAT);
  });
  it("success vs critical", function() {
    expect(what_victory(RESULT.SUCCESS, 3, RESULT.CRITICAL, 1)).toEqual(VICTORY.MINOR_DEFEAT);
  });
});

describe("what_victory (major defeat)", function() {
  it("fumble vs success", function() {
    expect(what_victory(RESULT.FUMBLE, 20, RESULT.SUCCESS, 6)).toEqual(VICTORY.MAJOR_DEFEAT);
  });
  it("failure vs critical", function() {
    expect(what_victory(RESULT.FAILURE, 15, RESULT.CRITICAL, 1)).toEqual(VICTORY.MAJOR_DEFEAT);
  });
});

describe("what_victory (complete defeat)", function() {
  it("fumble vs critical", function() {
    expect(what_victory(RESULT.FUMBLE, 20, RESULT.CRITICAL, 2)).toEqual(VICTORY.COMPLETE_DEFEAT);
  });
});

describe("what_victory (marginal victory)", function() {
  it("two failures", function() {
    expect(what_victory(RESULT.FAILURE, 15, RESULT.FAILURE, 17)).toEqual(VICTORY.MARGINAL_VICTORY);
  });
  it("two successes", function() {
    expect(what_victory(RESULT.SUCCESS, 9, RESULT.SUCCESS, 10)).toEqual(VICTORY.MARGINAL_VICTORY);
  });
  it("two criticals", function() {
    expect(what_victory(RESULT.CRITICAL, 1, RESULT.CRITICAL, 2)).toEqual(VICTORY.MARGINAL_VICTORY);
  });
});

describe("what_victory (minor victory)", function() {
  it("failure vs fumble", function() {
    expect(what_victory(RESULT.FAILURE, 15, RESULT.FUMBLE, 20)).toEqual(VICTORY.MINOR_VICTORY);
  });
  it("success vs failure", function() {
    expect(what_victory(RESULT.SUCCESS, 9, RESULT.FAILURE, 15)).toEqual(VICTORY.MINOR_VICTORY);
  });
  it("critical vs success", function() {
    expect(what_victory(RESULT.CRITICAL, 1, RESULT.SUCCESS, 2)).toEqual(VICTORY.MINOR_VICTORY);
  });
});

describe("what_victory (major victory)", function() {
  it("success vs fumble", function() {
    expect(what_victory(RESULT.SUCCESS, 6, RESULT.FUMBLE, 20)).toEqual(VICTORY.MAJOR_VICTORY);
  });
  it("critical vs failure", function() {
    expect(what_victory(RESULT.CRITICAL, 1, RESULT.FAILURE, 15)).toEqual(VICTORY.MAJOR_VICTORY);
  });
});

describe("what_victory (complete victory)", function() {
  it("critical vs fumble", function() {
    expect(what_victory(RESULT.CRITICAL, 1, RESULT.FUMBLE, 20)).toEqual(VICTORY.COMPLETE_VICTORY);
  });
});



describe("find_victory", function() {
  it("10/1 versus 15/20 is complete victory", function() {
    expect(find_victory(10, 0, 1, 15, 0, 20)).toEqual(VICTORY.COMPLETE_VICTORY);
  });
  it("10W1/1 versus 15W1/20 is complete victory", function() {
    expect(find_victory(10, 1, 1, 15, 1, 20)).toEqual(VICTORY.COMPLETE_VICTORY);
  });
  it("10/1 versus 15/19 is major victory", function() {
    expect(find_victory(10, 0, 1, 15, 0, 19)).toEqual(VICTORY.MAJOR_VICTORY);
  });
});
