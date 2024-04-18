using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

public class Calculation
{
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public long? Id { get; set; }
    public required string Display { get; set; }
    [Precision(18, 8)]
    public required decimal? Total { get; set; }
}