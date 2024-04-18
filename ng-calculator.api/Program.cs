using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

const string corsPolicyName = "localCors";

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var config = new ConfigurationBuilder()
        .AddJsonFile("appsettings.json", optional: false)
        .Build();

builder.Services.AddDbContextPool<AppDbContext>(options => 
    options.UseSqlServer(config.GetConnectionString("NGCalculator")));

builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

builder.Services.AddCors(options =>
{
    options.AddPolicy(name: corsPolicyName,
        builder =>
        {
            builder.SetIsOriginAllowed(origin => new Uri(origin).Host == "localhost")
                .AllowAnyMethod()
                .AllowAnyHeader();
        });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors(corsPolicyName);
app.UseExceptionHandler();

app.MapGet("/", () => new { Response = "all good" });

app.MapGet("/calculation/{id}", async (AppDbContext context, long id) => 
    await context.Calculations.FindAsync(id) is Calculation calculation 
        ? Results.Ok(calculation)
        : Results.Ok());

app.MapPost("/calculation", async (AppDbContext context, [FromBody] CalculationRequest request) =>
{
    var newCalculation = new Calculation{ Display = request.Display, Total = request.Total};
    context.Calculations.Add(newCalculation);
    await context.SaveChangesAsync();
    return Results.Created($"/calculation/{newCalculation.Id}", newCalculation);
});

app.MapGet("/calculation/latest", (AppDbContext context) =>
{
    var maxId = context.Calculations.Max(x => x.Id); 
    return maxId != null
        ? Results.Ok(maxId)
        : Results.NotFound();
});
    

//go ahead and apply migrations
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

app.Run();